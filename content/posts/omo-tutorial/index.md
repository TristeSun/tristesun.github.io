+++
title = "OMO 使用教程"
date = "2026-08-14T12:16:00"
slug = "omo-tutorial"
description = "oh-my-openagent（OMO）在 OpenCode 上的安装、ultrawork 编排与多智能体体系使用指南（基于本机实际安装状态）。"
tags = ["AI 编程", "教程"]
math = false
draft = false
+++

# oh-my-openagent（OMO）使用教程
> 面向只熟悉 OpenCode 基础操作的新手。
> 本文档基于**你当前这台 Mac 上的实际安装状态**编写，跟着做就能用。
## 1. OMO 是什么？
oh-my-openagent（简称 OMO / omo）是 OpenCode 的一个**增强插件**。装了它之后，OpenCode 不再只是"一个和 AI 对话的终端"，而是变成一套有**多个专业 AI 智能体协作**的团队系统：
- **Sisyphus**（主指挥官）：规划任务、把工作分派给其他智能体、盯着任务完成
- **Explore / Librarian**：快速搜索代码、查文档
- **Oracle / Momus / Metis**：架构咨询、方案评审
- **Hephaestus**：深度执行任务（GPT 系，需要订阅才能发挥）
- 等共 11 个智能体
你不需要手动指挥它们——只要说一句带 **`ultrawork`**（或 `ulw`）的话，Sisyphus 就会自动组队干活，干完才停。
## 2. 你这台机器装了什么
<table header-row="true">
<tr>
<td>项目</td>
<td>状态</td>
<td>位置</td>
</tr>
<tr>
<td>OpenCode</td>
<td>✅ 1.18.18</td>
<td>系统里</td>
</tr>
<tr>
<td>OMO 插件</td>
<td>✅ 4.19.4（Ultimate 版）</td>
<td>`~/.config/opencode/opencode.jsonc` 已注册</td>
</tr>
<tr>
<td>OMO 配置</td>
<td>✅ 已生成</td>
<td>`~/.omo/omo.jsonc`</td>
</tr>
<tr>
<td>可用模型</td>
<td>⚠️ 只有免费模型</td>
<td>`opencode/deepseek-v4-flash-free` 等 7 个</td>
</tr>
<tr>
<td>bun</td>
<td>✅ 1.3.14</td>
<td>跑 CLI 用</td>
</tr>
<tr>
<td>ast-grep</td>
<td>✅ 0.45.1</td>
<td>代码重构技能用</td>
</tr>
<tr>
<td>gh (GitHub CLI)</td>
<td>⚠️ 已装未登录</td>
<td>可选，GitHub 自动化用</td>
</tr>
</table>
### 重要：你的模型情况（先读这段）
你没有 Claude / OpenAI 等任何订阅，所以：
- OMO 安装时默认写的 `opencode/gpt-5-nano` **你用不了**，我已把所有智能体改成你真正能用的 **`opencode/deepseek-v4-flash-free`**（就是你现在这个会话用的模型）。
- 查看你能用的全部模型：在终端运行 `opencode models`，能看到 `opencode/` 开头的 7 个免费模型。
- **Sisyphus 官方推荐 Claude Opus 5，没有 Claude 订阅时它的编排效果会打折扣**——这是官方文档明确说的，不是故障。
## 3. 第一步：让插件生效
插件在你**下次启动 opencode 时才会加载**（本次会话是安装前启动的）。
```bash
# 关掉当前 opencode，然后重新打开
opencode
```
**怎么确认插件加载成功了？**
启动后随便问一句带 `ulw` 的话，比如：
```javascript
用 ulw 模式，看看当前目录的结构并总结
```
如果 Sisyphus 开始分工、出现多个智能体的执行过程，就说明 OMO 生效了。
## 4. 日常怎么用（重点）
### 4.1 最强指令：`ultrawork` / `ulw`
在消息里**带上这两个词任意一个**，OMO 就会进入"全编排模式"：自动规划 → 派智能体并行干活 → 干完为止。
```javascript
ulw 帮我把这个项目的 README 整理一下
```
```javascript
ultrawork 分析一下代码里有哪些 TODO 没做完
```
平时不想思考用什么模式？**无脑加 **`ulw`** 就行**，官方原话："The agent figures out the rest."
### 4.2 其他模式关键词（直接打这些词）
<table header-row="true">
<tr>
<td>你在消息里打</td>
<td>效果</td>
</tr>
<tr>
<td>`search`</td>
<td>专注网页/文档搜索</td>
</tr>
<tr>
<td>`analyze`</td>
<td>深度分析模式</td>
</tr>
<tr>
<td>`team mode` / `teammode`</td>
<td>强制团队协作模式（需要先在配置里开启，见第 7 节）</td>
</tr>
<tr>
<td>`hyperplan`</td>
<td>用 5 个"敌对评审"挑刺你的方案，之后才动手</td>
</tr>
</table>
### 4.3 斜杠命令（在输入框打 `/` 会弹出）
<table header-row="true">
<tr>
<td>命令</td>
<td>干什么</td>
<td>什么时候用</td>
</tr>
<tr>
<td>`/start-work`</td>
<td>先让规划智能体（Prometheus）问你问题、出方案，确认后自动执行</td>
<td>重要任务，先想清楚再动手</td>
</tr>
<tr>
<td>`/goal`</td>
<td>设置一个持续目标，AI 空闲时会自动继续推进直到完成</td>
<td>长任务挂后台</td>
</tr>
<tr>
<td>`/stop-continuation`</td>
<td>停止所有自动继续的机制</td>
<td>想让它停的时候</td>
</tr>
<tr>
<td>`/refactor`</td>
<td>智能重构代码（自动检查、验证）</td>
<td>改代码结构</td>
</tr>
<tr>
<td>`/handoff`</td>
<td>生成当前工作摘要，换新会话时带上继续干</td>
<td>换会话前</td>
</tr>
<tr>
<td>`/remove-ai-slops`</td>
<td>清理 AI 生成的垃圾代码模式</td>
<td>代码看着"AI 味"太重</td>
</tr>
<tr>
<td>`/init-deep`</td>
<td>生成项目的 [AGENTS.md](http://AGENTS.md) 知识库</td>
<td>新项目第一次用</td>
</tr>
<tr>
<td>`/hyperplan`</td>
<td>直接调用对抗式规划</td>
<td>同上 4.2</td>
</tr>
</table>
> 💡 新手最常用的两个：**`ulw`**（无脑全自动）和 **`/start-work`**（先规划后执行）。
### 4.4 技能（不用记，自动触发）
装了 OMO 后，一些技能会根据你的任务**自动加载**，比如：
- 涉及浏览器操作 → 自动用 Playwright
- 涉及 git 提交 → 自动用 git-master 规范提交
- 涉及 UI/前端 → 自动用 frontend 技能
你什么都不用做，正常说话就行。
## 5. 智能体（Agent）一览
Sisyphus 会自动调度它们，你**一般不用直接指定**，了解一下心里有数即可：
<table header-row="true">
<tr>
<td>智能体</td>
<td>角色</td>
<td>通俗理解</td>
</tr>
<tr>
<td>**Sisyphus**</td>
<td>主指挥官</td>
<td>大管家，派活、盯进度</td>
</tr>
<tr>
<td>**Prometheus**</td>
<td>战略规划师</td>
<td>动手前先访谈你、出方案</td>
</tr>
<tr>
<td>**Atlas**</td>
<td>任务清单管家</td>
<td>把大任务拆成清单跟踪</td>
</tr>
<tr>
<td>**Oracle**</td>
<td>架构/疑难顾问</td>
<td>想不通的问题问它</td>
</tr>
<tr>
<td>**Librarian**</td>
<td>资料检索员</td>
<td>查文档、查开源实现</td>
</tr>
<tr>
<td>**Explore**</td>
<td>代码搜索员</td>
<td>快速翻代码库</td>
</tr>
<tr>
<td>**Metis / Momus**</td>
<td>方案评审</td>
<td>挑毛病、把关</td>
</tr>
<tr>
<td>**Hephaestus**</td>
<td>深度执行者</td>
<td>埋头写代码（GPT 系，需订阅）</td>
</tr>
<tr>
<td>**Multimodal-Looker**</td>
<td>看图/PDF</td>
<td>截图、文档识别</td>
</tr>
<tr>
<td>**Sisyphus-Junior**</td>
<td>通用执行者</td>
<td>被派活的小弟</td>
</tr>
</table>
## 6. 换模型 / 改配置（了解即可）
所有智能体用的模型都写在 `~/.omo/omo.jsonc` 里。想改某个智能体的模型，编辑这个文件：
```json
{
  "[opencode]": {
    "agents": {
      "sisyphus": { "model": "opencode/deepseek-v4-flash-free" },
      "explore": { "model": "opencode/big-pickle" }
    }
  }
}
```
规则：
- 改完**重启 opencode** 生效
- 可用的模型用 `opencode models` 查
- 想临时关掉某个功能，配置文件里支持 `disabled_agents`、`disabled_skills` 等数组
- 备份文件在 `~/.omo/omo.jsonc.bak.*`（安装时自动生成的）
## 7. 可选：开启团队模式（Team Mode）
默认关闭。想玩"一个队长 + 多个队员并行"的多智能体协作，编辑 `~/.omo/omo.jsonc` 在 `[opencode]` 块里加：
```json
"team_mode": {
  "enabled": true,
  "max_parallel_members": 4,
  "max_members": 8
}
```
重启 opencode 后，`team mode` 关键词才生效。新手可以先不开。
## 8. 维护与排错
### 常用维护命令（注意：要按下面这种写法，见"已知坑"）
```bash
export OMO_WRAPPER_PACKAGE_ROOT=~/.config/opencode/node_modules/oh-my-openagent
bun ~/.config/opencode/node_modules/oh-my-openagent/node_modules/oh-my-openagent-darwin-arm64/bin/oh-my-opencode.js doctor
```
`doctor` 会体检：系统、配置、插件、模型、遥测等 8 项，退出码 0 = 全部通过。
### ⚠️ 已知坑：`bunx oh-my-openagent` 命令会报错
当前 4.19.4 版本的 CLI 包装脚本有个 ESM 兼容 bug，直接跑 `bunx oh-my-openagent doctor` 会报 `SyntaxError: Cannot use import statement outside a module`。
- **插件本身不受影响**（opencode 加载插件走的是另一条路径，正常工作）
- 只有你**手动敲 CLI 命令**时需要用上面第 8 节那种 `bun ...` 的写法绕开
### 常见问题速查
<table header-row="true">
<tr>
<td>现象</td>
<td>怎么办</td>
</tr>
<tr>
<td>说了 `ulw` 没反应</td>
<td>确认重启过 opencode；确认 `opencode.jsonc` 里有 `"oh-my-openagent@latest"`</td>
</tr>
<tr>
<td>某个智能体报模型错误</td>
<td>用 `opencode models` 看可用模型，把 `~/.omo/omo.jsonc` 里对应项改成可用的</td>
</tr>
<tr>
<td>想关掉匿名遥测</td>
<td>在 `~/.omo/omo.jsonc` 加 `"telemetry": false`，或终端 `export OMO_DISABLE_POSTHOG=1`</td>
</tr>
<tr>
<td>gh 相关功能不可用</td>
<td>终端运行 `gh auth login` 登录（可选功能，不影响其他）</td>
</tr>
<tr>
<td>后悔了想卸载</td>
<td>见第 9 节</td>
</tr>
</table>
## 9. 卸载（备查）
```bash
# 1. 从 opencode.jsonc 移除插件条目（手动编辑去掉 "oh-my-openagent@latest"）
# 2. 删除配置
rm -f ~/.omo/omo.jsonc ~/.omo/omo.json
# 3. 删除项目级配置（如果项目里有 .omo/ 目录）
rm -f .omo/omo.jsonc .omo/omo.json
```
## 10. 一句话总结
> **什么都别想，在 opencode 里正常说话，消息里带个 **`ulw`**，其余交给 OMO。**
---
*本文档基于 2026-08-14 的安装状态编写。配置文件：**`~/.config/opencode/opencode.jsonc`**、**`~/.omo/omo.jsonc`**。*
