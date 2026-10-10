# SPARQL 能力查询

根据能力问题验证 BDI 本体实现所需的查询。

## 心理实体查询

### 能力问题 1：有哪些心理实体？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?entity ?type WHERE {
    ?entity rdf:type ?type .
    ?type rdfs:subClassOf* bdi:MentalEntity .
}
```

### 能力问题 2：智能体持有哪些信念？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?label WHERE {
    ?agent bdi:hasMentalState ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?label }
}
```

### 能力问题 3：智能体有哪些愿望？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?label WHERE {
    ?agent bdi:hasDesire ?desire .
    ?desire a bdi:Desire .
    OPTIONAL { ?desire rdfs:label ?label }
}
```

### 能力问题 4：智能体已承诺哪些意图？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?label WHERE {
    ?agent bdi:hasIntention ?intention .
    ?intention a bdi:Intention .
    OPTIONAL { ?intention rdfs:label ?label }
}
```

## 动机链查询

### 能力问题 5：哪些信念促成了某项愿望？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?beliefLabel WHERE {
    ?desire bdi:isMotivatedBy ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?beliefLabel }
}
```

### 能力问题 6：某项意图要实现哪项愿望？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?desireLabel WHERE {
    ?intention bdi:fulfils ?desire .
    ?desire a bdi:Desire .
    OPTIONAL { ?desire rdfs:label ?desireLabel }
}
```

### 能力问题 7：哪些信念支持某项意图？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?label WHERE {
    ?intention bdi:isSupportedBy ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?label }
}
```

### 能力问题 8：追踪某项意图的完整认知链

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?desire ?belief ?worldState WHERE {
    ?intention a bdi:Intention ;
               bdi:fulfils ?desire ;
               bdi:isSupportedBy ?belief .
    ?desire bdi:isMotivatedBy ?belief .
    ?belief bdi:refersTo ?worldState .
}
```

## 心理过程查询

### 能力问题 9：哪个心理过程生成了某项信念？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?processType WHERE {
    ?process bdi:generates ?belief .
    ?belief a bdi:Belief .
    ?process a ?processType .
    FILTER(?processType != owl:NamedIndividual)
}
```

### 能力问题 10：什么触发了某个心理过程？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?trigger ?triggerType WHERE {
    ?process a bdi:MentalProcess ;
             bdi:isTriggeredBy ?trigger .
    ?trigger a ?triggerType .
}
```

### 能力问题 11：某个心理过程依据什么进行推理？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?input WHERE {
    ?process a bdi:MentalProcess ;
             bdi:reasonsUpon ?input .
}
```

## 计划与目标查询

### 能力问题 12：某项意图规定了什么计划？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?plan ?goal WHERE {
    ?intention bdi:specifies ?plan .
    ?plan a bdi:Plan ;
          bdi:addresses ?goal .
}
```

### 能力问题 13：计划中的任务顺序是什么？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan ?task ?nextTask WHERE {
    ?plan a bdi:Plan ;
          bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
}
ORDER BY ?task
```

### 能力问题 14：计划的第一个和最后一个任务是什么？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan ?firstTask ?lastTask WHERE {
    ?plan a bdi:Plan ;
          bdi:beginsWith ?firstTask ;
          bdi:endsWith ?lastTask .
}
```

### 能力问题 15：哪些动作执行了哪些任务？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?action ?task ?time WHERE {
    ?action bdi:isExecutionOf ?task ;
            bdi:atTime ?time .
}
ORDER BY ?time
```

## 时间查询

### 能力问题 16：某个时间点有哪些有效的心理状态？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?mentalState ?type WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
    ?mentalState a ?type .
    FILTER(?start <= "2026-01-04T10:00:00"^^xsd:dateTime &&
           ?end >= "2026-01-04T10:00:00"^^xsd:dateTime)
}
```

### 能力问题 17：某项信念何时形成？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?formationTime WHERE {
    ?process bdi:generates ?belief ;
             bdi:atTime ?formationTime .
    ?belief a bdi:Belief .
}
```

### 能力问题 18：某项意图的有效时间范围是什么？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?start ?end WHERE {
    ?intention a bdi:Intention ;
               bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
}
```

## 理由查询

### 能力问题 19：什么为某项信念提供理由？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?justification ?justLabel WHERE {
    ?belief a bdi:Belief ;
            bdi:isJustifiedBy ?justification .
    OPTIONAL { ?justification rdfs:label ?justLabel }
}
```

### 能力问题 20：什么为某项意图提供理由？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?justification ?justLabel WHERE {
    ?intention a bdi:Intention ;
               bdi:isJustifiedBy ?justification .
    OPTIONAL { ?justification rdfs:label ?justLabel }
}
```

## 组合结构查询

### 能力问题 21：复杂信念由哪些部分构成？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?part ?partLabel WHERE {
    ?belief a bdi:Belief ;
            bdi:hasPart ?part .
    OPTIONAL { ?part rdfs:label ?partLabel }
}
```

### 能力问题 22：查找组合式心理实体

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?composite (COUNT(?part) AS ?partCount) WHERE {
    ?composite bdi:hasPart ?part .
}
GROUP BY ?composite
HAVING (COUNT(?part) > 1)
```

## 世界状态查询

### 能力问题 23：某项信念指向什么世界状态？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?worldState ?wsComment WHERE {
    ?belief a bdi:Belief ;
            bdi:refersTo ?worldState .
    OPTIONAL { ?worldState rdfs:comment ?wsComment }
}
```

### 能力问题 24：哪些动作造成了某种世界状态？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?action ?worldState WHERE {
    ?action bdi:bringsAbout ?worldState .
    ?worldState a bdi:WorldState .
}
```

### 能力问题 25：智能体感知过哪些世界状态？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?agent ?worldState ?time WHERE {
    ?agent bdi:perceives ?worldState .
    OPTIONAL { ?worldState bdi:atTime ?time }
}
```

## 验证查询（OWLUnit 风格）

### 验证规则 1：每项意图必须且只能实现一个愿望

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention WHERE {
    ?intention a bdi:Intention .
    FILTER NOT EXISTS { ?intention bdi:fulfils ?desire }
}
# 预期结果：结果集为空
```

### 验证规则 2：每项信念都必须指向一个世界状态

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief WHERE {
    ?belief a bdi:Belief .
    FILTER NOT EXISTS { ?belief bdi:refersTo ?worldState }
}
# 预期结果：结果集为空 (or only abstract beliefs)
```

### 验证规则 3：心理过程必须具有推理对象

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process WHERE {
    ?process a bdi:MentalProcess .
    FILTER NOT EXISTS { ?process bdi:reasonsUpon ?input }
}
# 预期结果：结果集为空
```

### 验证规则 4：信念过程只能生成信念

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?generated WHERE {
    ?process a bdi:BeliefProcess ;
             bdi:generates ?generated .
    FILTER NOT EXISTS { ?generated a bdi:Belief }
}
# 预期结果：结果集为空
```

### 验证规则 5：计划必须指定起始和结束任务

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan WHERE {
    ?plan a bdi:Plan .
    FILTER NOT EXISTS {
        ?plan bdi:beginsWith ?first ;
              bdi:endsWith ?last
    }
}
# 预期结果：结果集为空
```

## 多智能体查询

### 能力问题 26：哪些信念由多个智能体共享？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief (COUNT(DISTINCT ?agent) AS ?agentCount) WHERE {
    ?agent bdi:hasMentalState ?belief .
    ?belief a bdi:Belief .
}
GROUP BY ?belief
HAVING (COUNT(DISTINCT ?agent) > 1)
```

### 能力问题 27：哪些智能体共享同一愿望？

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?agent1 ?agent2 WHERE {
    ?agent1 bdi:hasDesire ?desire .
    ?agent2 bdi:hasDesire ?desire .
    FILTER(?agent1 != ?agent2)
}
```
