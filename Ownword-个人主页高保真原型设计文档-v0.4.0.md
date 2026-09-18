# Ownword v0.4.0
# 个人主页高保真原型设计文档

## 1. Design Goal

本版本目标：建立 Ownword 公开个人主页（Public Personal Homepage）的高保真原型设计规范。

设计对象不是传统个人资料页，而是基于 BAP ID 的个人数字身份展示空间。

核心理念：

> Own your identity. Own your words.

个人身份与个人内容共同构成公开主页。

---

## 2. Product Concept

### 2.1 Identity First

BAP ID 是个人主页的身份根节点。

结构：

```
BAP ID
 |
 +-- Identity Profile
 |
 +-- Published Content
 |
 +-- Content Version
 |
 +-- Proof Record
```

### 2.2 Public Identity Space

访客进入主页后的认知路径：

```
认识这个人
      ↓
确认身份
      ↓
浏览创造内容
      ↓
了解持续积累
```

---

# 3. Information Architecture

```
Public Homepage
 |
 +-- Identity Hero
 |      Avatar
 |      Name
 |      BAP ID
 |      Bio
 |
 +-- Content Showcase
 |      Latest Words
 |      Published Works
 |
 +-- Content Archive
 |      Articles
 |      Versions
 |
 +-- Identity Footer
```

---

# 4. Visual Language

## 4.1 Dome & Horizon

品牌视觉采用 Dome + Horizon 表达身份空间。

- Dome：身份边界与保护空间
- Horizon：个人表达与未来延展

主页首屏应体现空间感，而不是普通信息卡片。

---

# 5. Homepage Layout

## 5.1 Hero Section

Desktop:

```
Dome Visual

Avatar

Name

BAP ID

Personal Introduction

Latest Words
```

Mobile:

```
Dome
Avatar
Name
BAP ID
Bio
Content
```

---

# 6. BAP ID Component

组件目标：展示唯一身份。

包含：

- BAP ID
- Copy Action
- Identity Status
- Associated Content

视觉要求：

- 使用等宽字体展示 ID
- 强调唯一性
- 与个人身份绑定

---

# 7. Identity Card

Identity Card 是主页核心组件。

Front:

```
Avatar
Name
Type
Bio
BAP ID
```

Back:

```
Publication Record
Transaction
Confirmation
```

支持翻转、查看完整身份信息。

---

# 8. Content Showcase

内容卡片不是普通文章卡片。

展示：

```
Title
Summary
Author BAP ID
Published Time
Revision
Proof Status
```

内容属于身份资产。

---

# 9. Content Reader

继承 v0.2.0 Content 原型能力：

- Markdown 阅读
- 目录导航
- 版本历史
- Proof 展示

---

# 10. Design System

基础设计系统：

React Spectrum 2 / S2 Design System

设计规范：

- Typography
- Spacing
- Radius
- Surface
- Interaction

---

# 11. Interaction

## Identity

- Hover Dome 光影
- Identity Card 翻转
- BAP ID Copy

## Content

- Card Preview
- Reader Transition
- Version Navigation

---

# 12. Responsive

支持：

- Desktop 1440px
- Tablet
- Mobile 390px

移动端保持：

- 身份优先
- 内容聚合
- 单列阅读

---

# 13. Prototype Implementation Guidance

实现原则：

1. BAP ID 为核心数据入口
2. Identity 与 Content 分离
3. Public View 与 Edit Flow 分离
4. 高保真原型优先表达体验，不提前定义生产链路

---

# Version

v0.4.0

Purpose:

Personal Homepage High Fidelity Prototype Specification
