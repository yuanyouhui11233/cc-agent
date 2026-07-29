# cc-agent

## 项目架构设计

```
src/
├── main.ts
├── app.module.ts
├── config/
│   └── ai.config.ts          # AI 模型配置
├── agents/
│   ├── agents.module.ts
│   ├── agents.controller.ts  # HTTP API 入口
│   ├── agents.service.ts     # Agent 业务逻辑
│   └── types/
│       └── agent.types.ts
├── tools/                    # Agent 可调用的工具
│   ├── tools.module.ts
│   ├── search-tool.service.ts
│   ├── calculator-tool.service.ts
│   └── weather-tool.service.ts
├── chains/                   # 独立 Chain（可选）
│   ├── chains.module.ts
│   └── qa-chain.service.ts
├── memory/                   # 对话记忆管理
│   ├── memory.module.ts
│   └── buffer-memory.service.ts
└── common/                   # 通用工具
    └── utils/
```
