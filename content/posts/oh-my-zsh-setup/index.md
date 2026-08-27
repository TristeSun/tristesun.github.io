+++
title = "Linux 服务器下（无 sudo 管理员权限）安装 oh-my-zsh"
date = "2024-11-26T15:00:00"
slug = "oh-my-zsh-setup"
description = "在没有 sudo 管理员权限的 Linux 服务器上，从源码安装 zsh 并配置 oh-my-zsh 的完整步骤。"
tags = ["Linux", "zsh"]
math = false
draft = false
+++

> 以下绝大多数操作在mac和windows上也可以使用（windows下需要先配置Windows terminal, zsh, vim, git等环境）

# 安装zsh

## 1.安装ncurses依赖

首先配置.bashrc文件

```
vim ~/.bashrc
```

添加如下环境变量

```
export CXXFLAGS="-fPIC"
export CFLAGS="-fPIC"
export NCURSES_HOME=$HOME/ncurses  # ncurses 目录
export PATH=$NCURSES_HOME/bin:$PATH
export LD_LIBRARY_PATH=$NCURSES_HOME/lib:$LD_LIBRARY_PATH
export CPPFLAGS="-I$NCURSES_HOME/include" LDFLAGS="-L$NCURSES_HOME/lib"
```

刷新

```
source ~/.bashrc
```

之后下载安装ncurses

```
cd ~ && mkdir ncurses && cd ncurses  # 新建一个ncurses的安装目录
wget http://ftp.gnu.org/pub/gnu/ncurses/ncurses-6.1.tar.gz  # 下载ncurses-6.1
tar -xzvf ncurses-6.1.tar.gz  # 解压
cd ncurses-6.1
./configure --prefix="$HOME/ncurses" --with-shared --without-debug --enable-widec  # 指定路径configure
make && make install  # 安装
```

## 2.安装zsh

安装zsh

```
cd ~
mkdir -p Applications/zsh-5.7.1 && cd Applications/zsh-5.7.1
wget -O zsh.tar.xz https://ftp.osuosl.org/pub/blfs/conglomeration/zsh/zsh-5.7.1.tar.xz
xz -d zsh.tar.xz && tar -xvf zsh.tar
cd zsh-5.7.1
# 生成Makefile
./configure --prefix=$HOME/Applications/zsh-5.7.1
# 编译安装
make && make install
```

设置  **bash_profile**  文件将zsh设置为默认终端

```
vim ~/.bash_profile
```

添加如下内容

```
exec $HOME/Applications/zsh-5.7.1/bin/zsh -l
```

刷新

```
source ~/.bash_profile
```

之后可以将  **bashrc**  文件中的   *conda*   环境设置复制到  **zshrc**  文件中，从而在zsh中使用conda环境。

# 安装oh-my-zsh

## 1.安装oh-my-zsh

按照官网教程

```
# 使用以下两种方法之一安装
# 1. wget
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# 2. curl
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

或使用国内镜像源

```
#curl下载
sh -c "$(curl -fsSL https://gitee.com/pocmon/ohmyzsh/raw/master/tools/install.sh)"
#wget下载
sh -c "$(wget -O- https://gitee.com/pocmon/ohmyzsh/raw/master/tools/install.sh)"
```

## 2.安装powerlevel10k主题

```
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
# 可以使用 gitee.com 上的官方镜像加速下载
git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

然后在.zshrc文件中设置主题

```
vim ~/.zshrc
```

添加如下内容

```
ZSH_THEME="powerlevel10k/powerlevel10k"
```

按指引配置即可。如果需要重新配置

```
p10k configure
```

## 3.安装相关插件

## 3.1.zsh-autosuggestions

```
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 可以使用下面任意一个加速下载
# 加速1
git clone https://github.moeyy.xyz/https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 加速2
git clone https://gh.xmly.dev/https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 加速3
git clone https://gh.api.99988866.xyz/https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

## 3.2.zsh-syntax-highlighting

```
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 可以使用下面任意一个加速下载
# 加速1
git clone https://github.moeyy.xyz/https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# 加速2
git clone https://gh.xmly.dev/https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# 加速3
git clone https://gh.api.99988866.xyz/https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

## 3.3.zsh-completions

```
git clone https://github.com/zsh-users/zsh-completions ${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions
#国内gitee源
git clone https://gitee.com/yuhldr/zsh-completions ${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions
```

## 3.4.将插件添加到.zshrc文件中

```
vim ~/.zshrc
```

添加如下内容

```
plugins=(
         git
         z
         zsh-autosuggestions
         zsh-syntax-highlighting
         zsh-completions
)
```

刷新

```
source ~/.zshrc
```
