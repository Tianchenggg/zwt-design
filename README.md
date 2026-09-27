# ZWT 设计作品展

Terra Zhang（张雯婷）的独立设计作品集。静态 HTML、CSS 与 JavaScript，无框架、无外部字体或追踪脚本。

## 本地预览

```sh
python3 -m http.server 3002 --bind 127.0.0.1 --directory dist
```

访问 `http://127.0.0.1:3002/`。部署目录是 `dist/`。

## GitHub Pages 发布

`main` 保存源文件；`gh-pages` 分支只包含 `dist/` 内容，独立于原有科研主页。

```sh
git add README.md dist
git commit -m "Update exhibition"
git push origin main
git subtree push --prefix=dist origin gh-pages
```

在 GitHub Pages 中使用 `gh-pages` 分支的根目录。无需 Node.js 安装、构建步骤或访问者登录。

## 展览内容

- 瑶池春晓：景观全貌、亭廊、水岸与花木细节。
- 锈色记忆·活力新生：景观全貌、曲线构筑、水庭与植物细节。
- 图像画廊支持放大、左右键切换和 Escape 关闭。
- 首页与尾页共用同一张透明抠图人像。

## 图像说明

手绘作品由用户提供，两张景观主视觉按用户要求由内置 ImageGen 辅助重绘，以改善清晰度和拍摄偏色。六张细节图裁自两张高清主图；网站按用户要求仅展示清晰版本，不含原始拍摄对比。重绘保留主要构图，但局部柱位、曲线和植物细节存在变化，不等同于无损修复或准确还原原纸色彩。原始资料留在本地，不包含在此仓库中。

图像已移除 EXIF / GPS 元数据。所有尺寸在 HTML 中声明，非首屏图像延迟加载。

设计师淡妆肖像由内置 ImageGen 基于本人提供的照片生成，再通过内置工具移除背景。原始私人肖像照片不包含在此仓库中。

动画使用 CSS transform / opacity 与一次性的 IntersectionObserver，不劫持滚动；尊重系统“减少动态效果”设置。

作品及肖像属于原作者，不因仓库公开而授予再使用许可。
