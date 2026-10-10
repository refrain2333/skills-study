# BDI RDF 示例

用于 BDI 心理状态建模的完整 RDF/Turtle 示例。

## 完整认知流程

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ============================================================
# 阶段 1：感知世界状态
# ============================================================

ex:WorldState_traffic a bdi:WorldState ;
    rdfs:comment "101 号公路交通拥堵" ;
    bdi:atTime "2026-01-04T08:30:00"^^xsd:dateTime ;
    bdi:isPerceivedBy ex:Agent_commuter ;
    bdi:triggers ex:BeliefProcess_assess_traffic .

# ============================================================
# 阶段 2：形成信念
# ============================================================

ex:BeliefProcess_assess_traffic a bdi:BeliefProcess ;
    bdi:generates ex:Belief_traffic_delay ;
    bdi:reasonsUpon ex:WorldState_traffic ;
    bdi:isProcessedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:31:00"^^xsd:dateTime .

ex:Belief_traffic_delay a bdi:Belief ;
    rdfs:label "交通拥堵预计造成 30 分钟延误" ;
    bdi:refersTo ex:WorldState_traffic ;
    bdi:hasValidity ex:TimeInterval_morning_commute ;
    bdi:hasPart ex:Belief_route_congested , ex:Belief_delay_duration ;
    bdi:isJustifiedBy ex:Justification_traffic_report ;
    bdi:motivates ex:Desire_arrive_on_time .

ex:Belief_route_congested a bdi:Belief ;
    rdfs:comment "101 号公路发生拥堵" .

ex:Belief_delay_duration a bdi:Belief ;
    rdfs:comment "预计延误 30 分钟" .

ex:Justification_traffic_report a bdi:Justification ;
    rdfs:label "导航系统提供的实时交通数据" ;
    bdi:justifies ex:Belief_traffic_delay .

# ============================================================
# 阶段 3：形成愿望
# ============================================================

ex:DesireProcess_plan_arrival a bdi:DesireProcess ;
    bdi:generates ex:Desire_arrive_on_time ;
    bdi:reasonsUpon ex:Belief_traffic_delay ;
    bdi:isProcessedBy ex:Agent_commuter .

ex:Desire_arrive_on_time a bdi:Desire ;
    rdfs:label "我希望准时到达工作地点" ;
    bdi:isMotivatedBy ex:Belief_traffic_delay ;
    bdi:refersTo ex:WorldState_on_time_arrival .

# ============================================================
# 阶段 4：确立意图
# ============================================================

ex:IntentionProcess_commit_route a bdi:IntentionProcess ;
    bdi:generates ex:Intention_take_alternate_route ;
    bdi:reasonsUpon ex:Desire_arrive_on_time ;
    bdi:isProcessedBy ex:Agent_commuter .

ex:Intention_take_alternate_route a bdi:Intention ;
    rdfs:label "我将改走 280 号公路" ;
    bdi:fulfils ex:Desire_arrive_on_time ;
    bdi:isSupportedBy ex:Belief_traffic_delay ;
    bdi:specifies ex:Plan_alternate_commute ;
    bdi:isJustifiedBy ex:Justification_time_optimization .

ex:Justification_time_optimization a bdi:Justification ;
    rdfs:label "根据当前路况，替代路线可节省 20 分钟" ;
    bdi:justifies ex:Intention_take_alternate_route .

# ============================================================
# 阶段 5：制定计划
# ============================================================

ex:Planning_route_selection a bdi:Planning ;
    bdi:reasonsUpon ex:Intention_take_alternate_route ;
    bdi:defines ex:Plan_alternate_commute ;
    bdi:atTime ex:TimeInterval_planning_phase .

ex:Plan_alternate_commute a bdi:Plan ;
    rdfs:label "经由 280 号公路通勤" ;
    bdi:addresses ex:Goal_arrive_by_9am ;
    bdi:beginsWith ex:Task_exit_Route101 ;
    bdi:endsWith ex:Task_arrive_parking ;
    bdi:hasComponent ex:Task_exit_Route101 , ex:Task_merge_280 ,
                     ex:Task_navigate_280 , ex:Task_arrive_parking .

ex:Task_exit_Route101 a bdi:Task ;
    rdfs:label "在 Whipple 大道驶离 101 号公路" ;
    bdi:precedes ex:Task_merge_280 .

ex:Task_merge_280 a bdi:Task ;
    rdfs:label "驶入 280 号公路北向车道" ;
    bdi:precedes ex:Task_navigate_280 .

ex:Task_navigate_280 a bdi:Task ;
    rdfs:label "沿 280 号公路行驶 8 英里" ;
    bdi:precedes ex:Task_arrive_parking .

ex:Task_arrive_parking a bdi:Task ;
    rdfs:label "到达办公室停车库" .

ex:Goal_arrive_by_9am a bdi:Goal ;
    rdfs:label "上午 9 点前到达工作地点" .

# ============================================================
# 阶段 6：执行计划
# ============================================================

ex:PlanExecution_commute a bdi:PlanExecution ;
    bdi:satisfies ex:Plan_alternate_commute ;
    bdi:addresses ex:Goal_arrive_by_9am ;
    bdi:isExecutedBy ex:Agent_commuter ;
    bdi:hasComponent ex:Action_exit , ex:Action_merge ,
                     ex:Action_drive_280 , ex:Action_park ;
    bdi:atTime ex:TimeInterval_execution ;
    bdi:bringsAbout ex:WorldState_arrived_on_time .

ex:Action_exit a bdi:Action ;
    bdi:isExecutionOf ex:Task_exit_Route101 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:35:00"^^xsd:dateTime .

ex:Action_merge a bdi:Action ;
    bdi:isExecutionOf ex:Task_merge_280 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:37:00"^^xsd:dateTime .

ex:Action_drive_280 a bdi:Action ;
    bdi:isExecutionOf ex:Task_navigate_280 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:40:00"^^xsd:dateTime .

ex:Action_park a bdi:Action ;
    bdi:isExecutionOf ex:Task_arrive_parking ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:bringsAbout ex:WorldState_arrived_on_time ;
    bdi:atTime "2026-01-04T08:52:00"^^xsd:dateTime .

# ============================================================
# 阶段 7：执行后的世界状态
# ============================================================

ex:WorldState_arrived_on_time a bdi:WorldState ;
    rdfs:comment "智能体于上午 8:52 到达工作地点" ;
    bdi:atTime "2026-01-04T08:52:00"^^xsd:dateTime .

# ============================================================
# 时间范围
# ============================================================

ex:TimeInterval_morning_commute a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:30:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T09:00:00"^^xsd:dateTime .

ex:TimeInterval_planning_phase a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:31:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T08:34:00"^^xsd:dateTime .

ex:TimeInterval_execution a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:35:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T08:52:00"^^xsd:dateTime .
```

## 多智能体协作示例

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix fipa: <http://www.fipa.org/specs/fipa00061/> .

# 多个智能体共享的项目截止时间信念
ex:Agent_developer a bdi:Agent ;
    bdi:hasMentalState ex:Belief_deadline_friday .

ex:Agent_manager a bdi:Agent ;
    bdi:hasMentalState ex:Belief_deadline_friday .

ex:Belief_deadline_friday a bdi:Belief ;
    rdfs:label "项目截止时间为周五下午 5 点" ;
    bdi:refersTo ex:WorldState_deadline ;
    bdi:hasValidity ex:TimeInterval_project_week .

ex:WorldState_deadline a bdi:WorldState ;
    rdfs:comment "项目 XYZ 必须在 2026-01-10T17:00:00 前交付" .

# 各智能体自身的心理状态
ex:Agent_developer
    bdi:hasDesire ex:Desire_complete_coding ;
    bdi:hasIntention ex:Intention_implement_features .

ex:Desire_complete_coding a bdi:Desire ;
    rdfs:label "完成所有功能实现" ;
    bdi:isMotivatedBy ex:Belief_deadline_friday .

ex:Intention_implement_features a bdi:Intention ;
    rdfs:label "实现功能 A、B 和 C" ;
    bdi:fulfils ex:Desire_complete_coding ;
    bdi:specifies ex:Plan_development .

ex:Agent_manager
    bdi:hasDesire ex:Desire_ensure_delivery ;
    bdi:hasIntention ex:Intention_coordinate_team .

ex:Desire_ensure_delivery a bdi:Desire ;
    rdfs:label "确保项目按时交付" ;
    bdi:isMotivatedBy ex:Belief_deadline_friday .

ex:Intention_coordinate_team a bdi:Intention ;
    rdfs:label "协调团队活动" ;
    bdi:fulfils ex:Desire_ensure_delivery ;
    bdi:specifies ex:Plan_project_management .

# FIPA 通信
ex:Message_M1 a fipa:ACLMessage ;
    fipa:sender ex:Agent_manager ;
    fipa:receiver ex:Agent_developer ;
    fipa:content ex:Belief_deadline_friday ;
    fipa:performative fipa:inform .
```

## 冲突解决示例

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .

# 相互冲突的地点信念
ex:Belief_at_home a bdi:Belief ;
    bdi:refersTo ex:WorldState_home ;
    rdfs:comment "智能体目前在家" .

ex:Belief_at_office a bdi:Belief ;
    bdi:refersTo ex:WorldState_office ;
    rdfs:comment "智能体目前在办公室" .

# 相互冲突的意图
ex:Intention_work_from_home a bdi:Intention ;
    bdi:isSupportedBy ex:Belief_at_home ;
    rdfs:label "今天在家办公" .

ex:Intention_attend_meeting a bdi:Intention ;
    bdi:isSupportedBy ex:Belief_at_office ;
    rdfs:label "参加现场会议" .

# 解决冲突的理由
ex:Justification_location_conflict a bdi:Justification ;
    rdfs:comment "不能同时身处家中和办公室" ;
    bdi:justifies ex:Intention_resolution .

# 冲突解决后的意图
ex:Intention_resolution a bdi:Intention ;
    rdfs:label "在家通过视频通话参加会议" ;
    bdi:fulfils ex:Desire_meeting_participation ;
    bdi:isSupportedBy ex:Belief_at_home ;
    bdi:isJustifiedBy ex:Justification_location_conflict .
```

## T2B2T 付款处理示例

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# 阶段 1：从三元组到信念（外部 RDF → 内部心理状态）

ex:WorldState_notification a bdi:WorldState ;
    rdfs:comment "推送通知：Ghadeh 通过 Zelle 请求支付 250 美元" ;
    bdi:atTime "2025-10-27T10:15:00"^^xsd:dateTime ;
    bdi:triggers ex:BeliefProcess_BP1 .

ex:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates ex:Belief_payment_request ;
    bdi:isProcessedBy ex:Agent_A .

ex:Belief_payment_request a bdi:Belief ;
    rdfs:label "Ghadeh 请求支付 250 美元" ;
    bdi:refersTo ex:WorldState_notification ;
    bdi:motivates ex:Desire_pay_Ghadeh .

ex:Desire_pay_Ghadeh a bdi:Desire ;
    rdfs:label "向 Ghadeh 支付 250 美元" ;
    bdi:isMotivatedBy ex:Belief_payment_request .

ex:Intention_I1 a bdi:Intention ;
    rdfs:label "向 Ghadeh 支付 250 美元" ;
    bdi:fulfils ex:Desire_pay_Ghadeh ;
    bdi:specifies ex:Plan_payment .

# 阶段 2：从信念到三元组（心理状态 → 外部 RDF）

ex:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies ex:Plan_payment ;
    bdi:bringsAbout ex:WorldState_payment_complete .

ex:WorldState_payment_complete a bdi:WorldState ;
    rdfs:comment "已通过 Zelle 向 Ghadeh 支付 250 美元" ;
    bdi:atTime "2025-10-27T10:20:00"^^xsd:dateTime .
```
