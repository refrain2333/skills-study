<!-- 由 researcher/scripts/validate_governance.py 生成，请勿手动编辑。 -->
# 权限规则表

- 章程版本： `1.0.0`
- 规则 SHA-256： `b207657ecd4d47239ed7b1fa6b6d75f1664848460e762bb435af789be4173697`
默认拒绝；显式拒绝规则优先于允许规则。

| 规则 | 结果 | 参与者 | 操作 | 资源 | 条件 | 原因代码 |
| --- | --- | --- | --- | --- | --- | --- |
| `agent-proposal-branch-push` | 允许 | `research_proposer`, `change_author` | `push_proposal` | `proposal_branch` | `automated_identity_disclosed 等于 true`; `human_review_path 等于 "pull_request"` | `GOVERNED_PROPOSAL_DELIVERY_ALLOWED` |
| `agent-pull-request-work` | 允许 | `research_proposer`, `change_author` | `open_pull_request`, `respond_to_review` | `pull_request` | `automated_identity_disclosed 等于 true`; `human_review_path 等于 "pull_request"` | `GOVERNED_PROPOSAL_DELIVERY_ALLOWED` |
| `agent-social-draft` | 允许 | `research_proposer`, `change_author` | `publish_draft` | `public_content_draft` | `automated_identity_disclosed 等于 true` | `PUBLIC_DRAFT_ALLOWED` |
| `author-candidate-change` | 允许 | `change_author` | `propose_change` | `candidate_artifact` | `automated_identity_disclosed 等于 true` | `DISCLOSED_CANDIDATE_CHANGE_ALLOWED` |
| `bounded-runtime-execution` | 允许 | `runtime_operator` | `execute_work` | `research_artifact`, `candidate_artifact` | `capability_grant_valid 等于 true` | `CAPABILITY_BOUND_EXECUTION_ALLOWED` |
| `community-candidate-proposal` | 允许 | `community_contributor` | `propose_change` | `candidate_artifact` | `human_review_path 等于 "pull_request"` | `COMMUNITY_PROPOSAL_ALLOWED` |
| `community-pull-request-work` | 允许 | `community_contributor` | `open_pull_request`, `respond_to_review` | `pull_request` | `human_review_path 等于 "pull_request"` | `COMMUNITY_PROPOSAL_ALLOWED` |
| `emergency-stop` | 允许 | `human_maintainer`, `runtime_operator` | `emergency_disable` | `emergency_control` | 无 | `EMERGENCY_DISABLE_ALLOWED` |
| `human-constitution-amendment` | 允许 | `human_maintainer` | `amend_constitution` | `constitution` | `authenticated 等于 true`; `human_review_path 等于 "pull_request"` | `HUMAN_CONSTITUTIONAL_CHANGE_ALLOWED` |
| `human-credential-destination-authority` | 允许 | `human_maintainer` | `authorize_credential_destination` | `credential_destination` | `authenticated 等于 true` | `HUMAN_SENSITIVE_AUTHORITY_ALLOWED` |
| `human-governed-merge` | 允许 | `human_maintainer` | `merge` | `pull_request`, `default_branch` | `authenticated 等于 true`; `latest_commit_reviewed 等于 true`; `required_checks_passed 等于 true` | `HUMAN_GOVERNED_PROMOTION_ALLOWED` |
| `human-private-export-authority` | 允许 | `human_maintainer` | `expose_private_record` | `private_record` | `authenticated 等于 true` | `HUMAN_SENSITIVE_AUTHORITY_ALLOWED` |
| `human-production-activation` | 允许 | `human_maintainer` | `activate_production` | `production_deployment` | `authenticated 等于 true`; `latest_commit_reviewed 等于 true`; `required_checks_passed 等于 true` | `HUMAN_GOVERNED_PROMOTION_ALLOWED` |
| `human-proposal-branch-push` | 允许 | `human_maintainer` | `push_proposal` | `proposal_branch` | `authenticated 等于 true` | `AUTHENTICATED_HUMAN_WORK_ALLOWED` |
| `human-protected-surface-change` | 允许 | `human_maintainer` | `change_protected_surface` | `protected_surface`, `evaluator_policy`, `hidden_evaluation`, `public_private_boundary` | `authenticated 等于 true`; `human_review_path 等于 "pull_request"` | `HUMAN_CONSTITUTIONAL_CHANGE_ALLOWED` |
| `human-pull-request-work` | 允许 | `human_maintainer` | `open_pull_request`, `respond_to_review` | `pull_request` | `authenticated 等于 true` | `AUTHENTICATED_HUMAN_WORK_ALLOWED` |
| `human-research-work` | 允许 | `human_maintainer` | `research`, `propose_change` | `research_artifact`, `candidate_artifact` | `authenticated 等于 true` | `AUTHENTICATED_HUMAN_WORK_ALLOWED` |
| `human-training-authority` | 允许 | `human_maintainer` | `approve_weight_training` | `weight_training` | `authenticated 等于 true` | `HUMAN_SENSITIVE_AUTHORITY_ALLOWED` |
| `independent-evaluation` | 允许 | `independent_verifier` | `evaluate` | `candidate_artifact`, `research_artifact` | `independent_of_author 等于 true` | `INDEPENDENT_EVALUATION_ALLOWED` |
| `independent-release-attestation` | 允许 | `release_attestor` | `attest_release` | `candidate_artifact`, `pull_request` | `independent_of_author 等于 true`; `candidate_digest_verified 等于 true` | `INDEPENDENT_ATTESTATION_ALLOWED` |
| `non-human-merge-denied` | 拒绝 | `research_proposer`, `change_author`, `independent_verifier`, `release_attestor`, `runtime_operator`, `community_contributor` | `merge`, `activate_production` | `pull_request`, `default_branch`, `production_deployment` | 无 | `HUMAN_MERGE_REQUIRED` |
| `non-human-sensitive-authority-denied` | 拒绝 | `research_proposer`, `change_author`, `independent_verifier`, `release_attestor`, `runtime_operator`, `community_contributor` | `expose_private_record`, `authorize_credential_destination`, `approve_weight_training` | `private_record`, `credential_destination`, `weight_training` | 无 | `SENSITIVE_AUTHORITY_REQUIRES_HUMAN` |
| `ordinary-protected-change-denied` | 拒绝 | `research_proposer`, `change_author`, `independent_verifier`, `release_attestor`, `runtime_operator`, `community_contributor` | `amend_constitution`, `change_protected_surface` | `constitution`, `protected_surface`, `evaluator_policy`, `hidden_evaluation`, `public_private_boundary` | 无 | `PROTECTED_SURFACE_REQUIRES_HUMAN` |
| `proposer-research` | 允许 | `research_proposer` | `research`, `propose_change` | `research_artifact`, `candidate_artifact` | `automated_identity_disclosed 等于 true` | `DISCLOSED_RESEARCH_PROPOSAL_ALLOWED` |
| `public-read` | 允许 | `human_maintainer`, `research_proposer`, `change_author`, `independent_verifier`, `release_attestor`, `runtime_operator`, `community_contributor` | `read` | `public_repository`, `research_artifact`, `candidate_artifact`, `pull_request`, `public_content_draft` | 无 | `PUBLIC_READ_ALLOWED` |
| `self-evaluation-denied` | 拒绝 | `independent_verifier`, `release_attestor` | `evaluate`, `attest_release` | `candidate_artifact`, `research_artifact`, `pull_request` | `independent_of_author 等于 false` | `SEPARATION_OF_DUTY_REQUIRED` |

## 仓库受保护区域

- `governance/**`
- `.github/workflows/**`
- `.github/CODEOWNERS`
- `researcher/rubrics/**`
- `researcher/benchmarks/**/hidden/**`
- `researcher/scripts/validate_*.py`
- `researcher/scripts/run_benchmarks.py`

## 章程不变量

- 只有 `human_maintainer` 可以获准执行 `merge`。
- 只有已合并提交可以晋级到生产环境。
- 未知参与者、操作、资源或缺失条件一律拒绝。
- 自动提交提案时必须披露身份，并经过拉取请求审查。
- 紧急停用会停止工作，但不会改变历史或权限。
