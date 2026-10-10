#!/usr/bin/env python3
"""Validate and render the machine-testable program constitution."""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

try:
    from governance_policy import Constitution, ConstitutionError, DEFAULT_CONSTITUTION
except ModuleNotFoundError:  # Imported as researcher.scripts.validate_governance.
    from researcher.scripts.governance_policy import (
        Constitution,
        ConstitutionError,
        DEFAULT_CONSTITUTION,
    )


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_VIEW = ROOT / "governance" / "generated" / "authority-table.md"
DEFAULT_FIXTURES = ROOT / "governance" / "fixtures" / "authority-decisions.jsonl"


def render_authority_table(constitution: Constitution) -> str:
    lines = [
        "<!-- 由 researcher/scripts/validate_governance.py 生成，请勿手动编辑。 -->",
        "# 权限规则表",
        "",
        f"- 章程版本：`{constitution.version}`",
        f"- 规则 SHA-256：`{constitution.digest}`",
        "默认拒绝；显式拒绝规则优先于允许规则。",
        "",
        "| 规则 | 结果 | 参与者 | 操作 | 资源 | 条件 | 原因代码 |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for rule in sorted(constitution.rules, key=lambda item: item["rule_id"]):
        conditions = rule.get("conditions", [])
        condition_text = "; ".join(
            f"`{item['key']} { {'equals': '等于'}.get(item['operator'], item['operator']) } {json.dumps(item.get('value'), ensure_ascii=False)}`"
            for item in conditions
        ) or "无"
        lines.append(
            "| `{rule}` | {effect} | {actors} | {actions} | {resources} | {conditions} | `{reason}` |".format(
                rule=rule["rule_id"],
                effect={"allow": "允许", "deny": "拒绝"}.get(rule["effect"], rule["effect"]),
                actors=", ".join(f"`{item}`" for item in rule["actors"]),
                actions=", ".join(f"`{item}`" for item in rule["actions"]),
                resources=", ".join(f"`{item}`" for item in rule["resources"]),
                conditions=condition_text,
                reason=rule["reason_code"],
            )
        )
    lines.extend(
        [
            "",
            "## 仓库受保护区域",
            "",
            *[f"- `{pattern}`" for pattern in constitution.document["protected_surfaces"]],
            "",
            "## 章程不变量",
            "",
            "- 只有 `human_maintainer` 可以获准执行 `merge`。",
            "- 只有已合并提交可以晋级到生产环境。",
            "- 未知参与者、操作、资源或缺失条件一律拒绝。",
            "- 自动提交提案时必须披露身份，并经过拉取请求审查。",
            "- 紧急停用会停止工作，但不会改变历史或权限。",
            "",
        ]
    )
    return "\n".join(lines)


def load_fixtures(path: Path) -> list[dict[str, Any]]:
    fixtures: list[dict[str, Any]] = []
    seen: set[str] = set()
    for line_number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            fixture = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ConstitutionError(f"{path}:{line_number}: invalid JSON: {exc}") from exc
        if not isinstance(fixture, dict):
            raise ConstitutionError(f"{path}:{line_number}: fixture must be an object")
        case_id = fixture.get("case_id")
        if not isinstance(case_id, str) or not case_id:
            raise ConstitutionError(f"{path}:{line_number}: case_id is required")
        if case_id in seen:
            raise ConstitutionError(f"{path}:{line_number}: duplicate case_id {case_id}")
        seen.add(case_id)
        fixtures.append(fixture)
    return fixtures


def validate_fixtures(constitution: Constitution, path: Path) -> list[str]:
    errors: list[str] = []
    for fixture in load_fixtures(path):
        decision = constitution.decide(
            fixture["actor"],
            fixture["action"],
            fixture["resource"],
            fixture.get("context", {}),
        )
        if decision.allowed is not fixture["allowed"]:
            errors.append(
                f"{fixture['case_id']}: expected allowed={fixture['allowed']}, got {decision.allowed}"
            )
        if decision.reason_code != fixture["reason_code"]:
            errors.append(
                f"{fixture['case_id']}: expected {fixture['reason_code']}, got {decision.reason_code}"
            )
    return errors


def validate_invariants(constitution: Constitution) -> list[str]:
    errors: list[str] = []
    permissive_context = {
        "authenticated": True,
        "latest_commit_reviewed": True,
        "required_checks_passed": True,
        "automated_identity_disclosed": True,
        "human_review_path": "pull_request",
        "independent_of_author": True,
        "candidate_digest_verified": True,
        "capability_grant_valid": True,
    }
    combinations = 0
    for actor in constitution.actor_classes:
        for action in constitution.actions:
            for resource in constitution.resource_classes:
                combinations += 1
                decision = constitution.decide(actor, action, resource, permissive_context)
                if decision.allowed and action in {"merge", "activate_production"} and actor != "human_maintainer":
                    errors.append(f"non-human promotion allowed: {actor}/{action}/{resource}")
                if decision.allowed and action in {
                    "amend_constitution",
                    "change_protected_surface",
                    "expose_private_record",
                    "authorize_credential_destination",
                    "approve_weight_training",
                } and actor != "human_maintainer":
                    errors.append(f"non-human protected authority allowed: {actor}/{action}/{resource}")
    if combinations == 0:
        errors.append("authority cross-product was empty")

    for actor in set(constitution.actor_classes) - {"human_maintainer"}:
        decision = constitution.decide(actor, "merge", "pull_request", permissive_context)
        if decision.allowed:
            errors.append(f"{actor} can merge")

    if constitution.classify_path("governance/constitution.yaml") != "protected_surface":
        errors.append("constitution path is not protected")
    if constitution.classify_path("skills/evaluation/SKILL.md") != "public_repository":
        errors.append("ordinary public path was classified as protected")
    return errors


def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
        delete=False,
    ) as handle:
        handle.write(text)
        handle.flush()
        os.fsync(handle.fileno())
        temporary = Path(handle.name)
    temporary.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="validate policy, fixtures, and generated view")
    mode.add_argument("--write", action="store_true", help="validate and atomically refresh generated view")
    mode.add_argument("--decision", action="store_true", help="print one machine-readable policy decision")
    parser.add_argument("--constitution", type=Path, default=DEFAULT_CONSTITUTION)
    parser.add_argument("--view", type=Path, default=DEFAULT_VIEW)
    parser.add_argument("--fixtures", type=Path, default=DEFAULT_FIXTURES)
    parser.add_argument("--expected-digest")
    parser.add_argument("--actor")
    parser.add_argument("--action")
    parser.add_argument("--resource")
    parser.add_argument("--context-json", default="{}")
    args = parser.parse_args()

    try:
        constitution = Constitution.load(args.constitution, expected_digest=args.expected_digest)
        if args.decision:
            if not all([args.actor, args.action, args.resource]):
                parser.error("--decision requires --actor, --action, and --resource")
            context = json.loads(args.context_json)
            if not isinstance(context, dict):
                raise ConstitutionError("--context-json must decode to an object")
            print(
                json.dumps(
                    constitution.decide(args.actor, args.action, args.resource, context).to_dict(),
                    indent=2,
                    sort_keys=True,
                )
            )
            return 0

        errors = validate_invariants(constitution)
        errors.extend(validate_fixtures(constitution, args.fixtures))
        rendered = render_authority_table(constitution)
        if args.write:
            atomic_write(args.view, rendered)
        elif not args.view.exists():
            errors.append(f"generated view is missing: {args.view}")
        elif args.view.read_text(encoding="utf-8") != rendered:
            errors.append(f"generated view is stale: run {Path(__file__).name} --write")
        if errors:
            for error in errors:
                print(f"[error] {error}")
            return 1
        cross_product = (
            len(constitution.actor_classes)
            * len(constitution.actions)
            * len(constitution.resource_classes)
        )
        print(
            f"Governance validation passed: version {constitution.version}, "
            f"{len(constitution.rules)} rules, {cross_product} exhaustive decisions, "
            f"digest {constitution.digest[:12]}"
        )
        return 0
    except (ConstitutionError, OSError, json.JSONDecodeError) as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
