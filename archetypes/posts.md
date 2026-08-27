+++
title = '{{ replace .File.ContentBaseName "-" " " }}'
date = '{{ now.Format "2006-01-02T15:04:05" }}'
slug = '{{ .File.ContentBaseName }}'
description = ''
tags = []
categories = []
math = false          # 含公式则改 true（KaTeX 按需加载）
draft = true
+++
