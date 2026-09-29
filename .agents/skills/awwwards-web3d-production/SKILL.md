---
name: awwwards-web3d-production
description: Quy chuẩn kỹ thuật sản xuất Web 3D đạt chuẩn Awwwards/Dribbble. Cung cấp toàn bộ kiến trúc đồ họa WebGL/Three.js chuyên sâu, procedural city modeling vát cạnh (chamfered bevels), custom GLSL shaders (radar sonar pulse, photon highway, infinite grid, forcefield, curl noise), studio lighting rig 3 điểm, vật liệu PBR MeshPhysicalMaterial, bộ xử lý hậu kỳ UnrealBloom/ACES Filmic, đồng bộ GSAP ScrollTrigger + Lenis Smooth Scroll, hệ thống âm thanh không gian Web Audio Foley, HUD Telemetry và định vị điểm neo 3D sang 2D (Hotspot leader lines).
---

# QUY CHUẨN KỸ THUẬT SẢN XUẤT WEB 3D ĐẠT CHUẨN AWWWARDS & DRIBBBLE
> **Kỹ năng chuyên sâu độc quyền (Master Production Skill)** dành cho Kỹ sư Đồ họa Web & Nhà Thiết kế Giao diện UniSynapse.
> Tài liệu đúc kết trực tiếp từ 6 Case Study hàng đầu thế giới: NATIX Smart Camera Mapping Network (Sigma Software Design), Tesla Cybertruck Web Concept (Mariusz Mitkow), các hệ thống WebGL tương tác đạt Site of the Day / Site of the Month.


---

## MỤC LỤC CHI TIẾT TOÀN DIỆN (35 CHƯƠNG CHUYÊN SÂU)
1. [Triết Lý Cốt Lõi & 10 Nguyên Tắc "Tử Huyệt" Của Web 3D](#1-triết-lý-cốt-lõi--10-nguyên-tắc-tử-huyệt-của-web-3d)
2. [Kiến Trúc Đồ Họa 3 Tầng (The 3-Layer Web 3D Architecture)](#2-kiến-trúc-đồ-họa-3-tầng-the-3-layer-web-3d-architecture)
3. [Toán Học Hình Học Thủ Tục (Procedural Geometry & Math)](#3-toán-học-hình-học-thủ-tục-procedural-geometry--math)
4. [Hệ Thống Vật Liệu PBR Chuyên Sâu & Ánh Sáng Studio Cinematic](#4-hệ-thống-vật-liệu-pbr-chuyên-sâu--ánh-sáng-studio-cinematic)
5. [Lập Trình Custom GLSL Shaders Đỉnh Cao](#5-lập-trình-custom-glsl-shaders-đỉnh-cao)
6. [Bộ Xử Lý Hậu Kỳ (Post-Processing & Cinematic FX Pipeline)](#6-bộ-xử-lý-hậu-kỳ-post-processing--cinematic-fx-pipeline)
7. [Hệ Thống Điều Khiển Camera & Đồng Bộ Cuộn Trang (GSAP + Lenis)](#7-hệ-thống-điều-khiển-camera--đồng-bộ-cuộn-trang-gsap--lenis)
8. [Tương Tác Không Gian & Định Vị Tọa Độ 3D Sang 2D (Hotspot Tracking)](#8-tương-tác-không-gian--định-vị-tọa-độ-3d-sang-2d-hotspot-tracking)
9. [Hệ Thống Âm Thanh Không Gian Web Audio Foley](#9-hệ-thống-âm-thanh-không-gian-web-audio-foley)
10. [Hệ Thống Giao Diện HUD Telemetry, Bento Grid 2.0 & Swiss Typography](#10-hệ-thống-giao-diện-hud-telemetry-bento-grid-20--swiss-typography)
11. [Tối Ưu Hóa Hiệu Năng 60FPS Tuyệt Đối & Mobile Engineering](#11-tối-ưu-hóa-hiệu-năng-60fps-tuyệt-đối--mobile-engineering)
12. [Mẫu Triển Khai Hoàn Chỉnh Độc Lập (Full Standalone Production Template)](#12-mẫu-triển-khai-hoàn-chỉnh-độc-lập-full-standalone-production-template)
13. [Bảng Kiểm Định Kỹ Thuật 50 Tiêu Chí Trước Khi Xuất Xưởng (Production Checklist)](#13-bảng-kiểm-định-kỹ-thuật-50-tiêu-chí-trước-khi-xuất-xưởng-production-checklist)
14. [Kiến Trúc Tích Hợp React Three Fiber (R3F) & Next.js 14 App Router](#14-kiến-trúc-tích-hợp-react-three-fiber-r3f--nextjs-14-app-router)
15. [Tích Hợp Spline 3D Runtime & Cầu Nối JavaScript](#15-tích-hợp-spline-3d-runtime--cầu-nối-javascript)
16. [Hệ Thống 15 Pipeline Chuyên Biệt Độc Lập Cho UniSynapse](#16-hệ-thống-15-pipeline-chuyên-biệt-độc-lập-cho-unisynapse)
17. [Quy Trình Tự Động Hóa Blender Python & Xuất Asset Chuẩn Draco](#17-quy-trình-tự-động-hóa-blender-python--xuất-asset-chuẩn-draco)
18. [Cẩm Nang Gỡ Lỗi & Sửa Lỗi WebGL Kinh Điển (Troubleshooting Encyclopedia)](#18-cẩm-nang-gỡ-lỗi--sửa-lỗi-webgl-kinh-điển-troubleshooting-encyclopedia)
19. [Mã Nguồn Thực Thi Chi Tiết Của 15 Pipeline Chuyên Biệt](#19-mã-nguồn-thực-thi-chi-tiết-của-15-pipeline-chuyên-biệt)
20. [Thư Viện Custom GLSL Shader Đỉnh Cao Cho Giao Diện Web3 & Sci-Fi](#20-thư-viện-custom-glsl-shader-đỉnh-cao-cho-giao-diện-web3--sci-fi)
21. [Nền Tảng Toán Học & Vật Lý Đồ Họa Máy Tính Dành Cho Web 3D](#21-nền-tảng-toán-học--vật-lý-đồ-họa-máy-tính-dành-cho-web-3d)
22. [Kịch Bản Thực Thi 4 Phân Hệ Nòng Cốt Của UniSynapse Trong Không Gian 3D](#22-kịch-bản-thực-thi-4-phân-hệ-nòng-cốt-của-unisynapse-trong-không-gian-3d)
23. [Hệ Thống Giao Diện HUD Telemetry & Thiết Kế Đồ Họa Cybernetic Toàn Diện](#23-hệ-thống-giao-diện-hud-telemetry--thiết-kế-đồ-họa-cybernetic-toàn-diện)
24. [Kiến Trúc Kết Nối Trạng Thái Zustand Với WebGL Canvas (Global State Bridge)](#24-kiến-trúc-kết-nối-trạng-thái-zustand-với-webgl-canvas-global-state-bridge)
25. [Kết Luận & Chuẩn Mực Bàn Giao](#25-kết-luận--chuẩn-mực-bàn-giao)
26. [Thư Viện Toán Học GLSL Noise Chuyên Sâu (Procedural Shader Noise Encyclopedia)](#26-thư-viện-toán-học-glsl-noise-chuyên-sâu-procedural-shader-noise-encyclopedia)
27. [Mẫu Triển Khai Hoàn Chỉnh Tesla Cybertruck 3D Configurator (Standalone Demo)](#27-mẫu-triển-khai-hoàn-chỉnh-tesla-cybertruck-3d-configurator-standalone-demo)
28. [Bóc Tách Các Case Study Kinh Điển Thế Giới (Awwwards of the Year)](#28-bóc-tách-các-case-study-kinh-điển-thế-giới-awwwards-of-the-year)
29. [Kết Nối WebSocket Real-Time Từ FastAPI Đến WebGL Three.js](#29-kết-nối-websocket-real-time-từ-fastapi-đến-webgl-threejs)
30. [Tổng Kết Bản Quy Chuẩn Kỹ Thuật & Lời Tuyên Ngôn](#30-tổng-kết-bản-quy-chuẩn-kỹ-thuật--lời-tuyên-ngôn)
31. [Phụ Lục A: Ma Trận So Sánh Các Công Nghệ Đồ Họa Web (Selection Matrix)](#31-phụ-lục-a-ma-trận-so-sánh-các-công-nghệ-đồ-họa-web-selection-matrix)
32. [Phụ Lục B: Kiểm Thử Hồi Quy Thị Giác Tự Động Cho WebGL (Automated Visual Testing)](#32-phụ-lục-b-kiểm-thử-hồi-quy-thị-giác-tự-động-cho-webgl-automated-visual-testing)
33. [Phụ Lục C: Từ Điển Thuật Ngữ Đồ Họa Máy Tính Dành Cho Kỹ Sư WebGL](#33-phụ-lục-c-từ-điển-thuật-ngữ-đồ-họa-máy-tính-dành-cho-kỹ-sư-webgl)
34. [Phụ Lục D: Sổ Tay Vận Hành Kỹ Thuật & Quy Trình Phát Triển (Production Runbook & SOP)](#34-phụ-lục-d-sổ-tay-vận-hành-kỹ-thuật--quy-trình-phát-triển-production-runbook--sop)
35. [Phụ Lục E: 30 Câu Hỏi & Đáp Kỹ Thuật Hóc Búa Nhất (Expert WebGL FAQ)](#35-phụ-lục-e-30-câu-hỏi--đáp-kỹ-thuật-hóc-búa-nhất-expert-webgl-faq)


---

## 1. TRIẾT LÝ CỐT LÕI & 10 NGUYÊN TẮC "TỬ HUYỆT" CỦA WEB 3D

Đa số các dự án Web 3D hiện nay thất bại vì người lập trình chỉ xem WebGL là một công cụ "chèn hình 3D vào trang web" thay vì tiếp cận như một **tác phẩm điện ảnh tương tác kỹ thuật số (Interactive Cinematic Experience)**. Dưới đây là 10 nguyên tắc sống còn định hình sự khác biệt giữa một trang web 3D nghiệp dư và một tác phẩm đoạt giải Site of the Year:

### 1.1. 10 Nguyên Tắc "Tử Huyệt" Cần Khắc Cốt Ghi Tâm

#### 1. Tuyệt đối không dùng hình học nguyên thủy chưa qua xử lý (No Raw Primitives)
- **Lỗi nghiệp dư**: Đưa trực tiếp `BoxGeometry`, `CylinderGeometry`, `SphereGeometry` với các cạnh vuông sắc bén 90 độ vào khung cảnh. Trong thế giới vật lý thực tế, không có vật thể nào có cạnh sắc tuyệt đối 90 độ; mọi cạnh đều có độ vát (bevel/chamfer) hoặc bo tròn vi mô (fillet) để bắt sáng.
- **Tiêu chuẩn Awwwards**: Mọi khối kiến trúc, thiết bị hay linh kiện đều phải được tạo bằng hình học vát cạnh (**Chamfered Bevel**) hoặc mô hình bóc tách chi tiết. Các cạnh vát này là nơi đón nhận ánh sáng phản quang (Specular Highlights), tạo nên các vệt sáng chạy dọc mép khối kim loại.

#### 2. Cấm kỵ sử dụng màu sắc thuần khiết bão hòa cao (Ban Raw Saturated Colors)
- **Lỗi nghiệp dư**: Sử dụng các mã màu cơ bản như `#ff0000`, `#00ff00`, `#0000ff`, hoặc các màu Tailwind quá sặc sỡ trên nền đen tuyền.
- **Tiêu chuẩn Awwwards**: Sử dụng **Cybernetic Obsidian Palette** – bảng màu kim loại tối sẫm có chiều sâu quang học. Nền không bao giờ là màu đen `#000000` thuần mà là sắc chàm đen sâu `#040508` hoặc sắc lam sẫm `#06080e`. Các màu kim loại dao động từ `#121620` (Gunmetal) đến `#1a2232`. Màu phát sáng (Emissive/Accent) chỉ dùng các dải bước sóng điện từ tinh khiết: Xanh băng 6500K (`#8ec5fc`), Xanh cyan điện tử (`#00f2fe`), hoặc Tím thạch anh Solana (`#9945ff`).

#### 3. Phải có hệ thống chiếu sáng Studio 3 nguồn (3-Point Cinematic Lighting Rig)
- **Lỗi nghiệp dư**: Chỉ đặt 1 chiếc `AmbientLight` sáng mờ đều toàn khung hình hoặc 1 chiếc `DirectionalLight` chiếu trực diện làm vật thể phẳng lì như giấy carton.
- **Tiêu chuẩn Awwwards**: Luôn thiết lập bộ 3 đèn điện ảnh:
  - **Key Light (Đèn chính)**: Chiếu xiên góc thấp 30-45 độ tạo bóng đổ dài, kích hoạt `castShadow` với thuật toán làm mềm bóng `PCFSoftShadowMap`.
  - **Rim / Back Light (Đèn viền phía sau)**: Đặt đối diện camera, chiếu vào gáy vật thể với cường độ gấp 2-3 lần đèn chính, sử dụng màu lạnh dịu để "cắt" hình khối 3D tách bạch hoàn toàn khỏi phông nền đen.
  - **Fill / Ambient Light (Đèn bù)**: Cường độ rất thấp (0.1 - 0.2) với sắc thái màu đối lập (nếu Key Light màu ấm thì Fill Light màu lam lạnh) nhằm giữ lại chi tiết vùng tối mà không làm mất độ tương phản.

#### 4. Khử tuyệt đối hiện tượng giật chuột (Zero Scroll Stuttering)
- **Lỗi nghiệp dư**: Gắn trực tiếp góc quay camera hoặc vị trí vật thể vào sự kiện cuộn trang thông thường `window.addEventListener("scroll")`. Chuột máy tính truyền xung ngắt quãng (discrete steps), khiến cảnh 3D bị giật cục, gây cảm giác khó chịu và say xe thị giác.
- **Tiêu chuẩn Awwwards**: Bắt buộc phải tích hợp thư viện **Lenis Smooth Scroll** hoặc thuật toán nội suy Lerp (Linear Interpolation). Dữ liệu cuộn trang được làm mịn với hệ số ma sát trước khi cấp vào timeline của camera, tạo cảm giác lướt êm ái như một chiếc drone đang bay trong không gian.

#### 5. Bắt buộc có lớp xử lý hậu kỳ (Post-Processing Mastery)
- **Lỗi nghiệp dư**: Render thẳng canvas WebGL ra màn hình. Khi đó các chùm laser, đèn neon chỉ là những vệt màu phẳng bẹt.
- **Tiêu chuẩn Awwwards**: Tích hợp `EffectComposer` với **UnrealBloomPass** (tạo quầng hào quang phát sáng mềm mại cho laser và node mạng), **ACESFilmicToneMapping** (cân chỉnh dải tương phản động rực rỡ như phim điện ảnh Hollywood), và một lớp mỏng **Film Grain Shader** (khử hiện tượng dải màu banding trên nền tối).

#### 6. Giao diện 2D và không gian 3D phải gắn kết hữu cơ (Spatial Symbiosis)
- **Lỗi nghiệp dư**: Một bên là canvas 3D nằm trơ trọi, một bên là các khối HTML div thông thường đè lên trên mà không có bất kỳ mối liên hệ nào.
- **Tiêu chuẩn Awwwards**: Ứng dụng kỹ thuật **3D-to-2D Coordinate Projection**. Các thông số kỹ thuật, thẻ số liệu, nút tương tác phải có điểm neo gốc trong không gian 3D (`Vector3.project(camera)`), kèm theo các đường chỉ dẫn SVG (Leader Lines) co giãn mềm mại khi camera xoay chuyển.

#### 7. Nghệ thuật kể chuyện dẫn dắt theo từng phân cảnh (Scroll-Driven Narrative)
- **Lỗi nghiệp dư**: Để người dùng tự do xoay chuột không mục đích hoặc để vật thể 3D trôi tuột theo trang web.
- **Tiêu chuẩn Awwwards**: Sử dụng kỹ thuật **Section Pinning** (Ghim màn hình) của GSAP ScrollTrigger. Mỗi khi cuộn chuột đến một nội dung, màn hình được khóa lại, năng lượng cuộn chuột được chuyển đổi thành hành động của camera: lia cận cảnh vào lõi xử lý, bung các lớp cấu trúc (Exploded View), hoặc mở đường hầm kiểm định.

#### 8. Tương tác con trỏ chuột đa chiều (Fluid Cursor & 3D Tilt Inertia)
- **Lỗi nghiệp dư**: Chuột di chuyển trên trang web nhưng cảnh 3D đứng im như tượng.
- **Tiêu chuẩn Awwwards**: Mọi chuyển động của chuột đều tác động một lực quán tính vi mô lên góc quay camera (Parallax Tilt). Khi chuột rê vào các nút bấm, con trỏ phóng to và hút dính vào tâm nút bấm (Magnetic Snap), kích hoạt hiệu ứng phản xạ ánh sáng trên bề mặt kim loại 3D gần nhất.

#### 9. Thiết kế âm thanh không gian (Spatial Audio Foley)
- **Lỗi nghiệp dư**: Trang web hoàn toàn câm lặng, chỉ có hình ảnh đơn điệu.
- **Tiêu chuẩn Awwwards**: Sử dụng Web Audio API để tổng hợp các âm thanh tinh tế: tiếng rung trầm sâu thẳm của động cơ lượng tử (`Sub-bass 42Hz`), tiếng lách cách cơ học khi hover chuột qua các điểm nút (`Tactile Click`), và tiếng sóng radar ngân vang khi quét qua các node dữ liệu.

#### 10. Tối ưu hóa hiệu năng đạt chuẩn 60FPS tuyệt đối (The 60FPS Imperative)
- **Lỗi nghiệp dư**: Tạo hàng ngàn `Mesh` độc lập khiến Draw Calls tăng vọt lên hàng nghìn, làm sập card đồ họa trên điện thoại di động.
- **Tiêu chuẩn Awwwards**: Áp dụng triệt để **InstancedMesh** (hàng ngàn tòa nhà chỉ tốn đúng 1 Draw Call duy nhất), nướng bóng đổ và ánh sáng phức tạp từ Blender Cycles vào **Baked Textures**, nén mô hình định dạng Draco/GLB và tự động hạ cấu hình thông minh trên các thiết bị di động.


---

## 2. KIẾN TRÚC ĐỒ HỌA 3 TẦNG (THE 3-LAYER WEB 3D ARCHITECTURE)

Để tạo ra chiều sâu thị giác vô tận và sự hòa quyện hoàn hảo giữa công nghệ đồ họa máy tính với trải nghiệm người dùng hiện đại, hệ thống được cấu trúc thành 3 tầng phân lớp rõ rệt theo trục Z (Z-Index Spatial Stacking):

```
+-----------------------------------------------------------------------------------------------+
| TẦNG 3: DOM KINETIC HUD & BENTO GRID OVERLAY (z-index: 20, pointer-events: none)              |
| - Navbar phát sáng viền, thanh Telemetry Tọa Độ GPS thời gian thực                           |
| - Thẻ thông tin kính mờ Frosted Glassmorphism (pointer-events: auto)                         |
| - Con trỏ chuột từ tính (Magnetic Reticle Cursor)                                            |
+-----------------------------------------------------------------------------------------------+
                                                ▲
                                                │ Chiếu tọa độ Vector3.project(camera)
+-----------------------------------------------------------------------------------------------+
| TẦNG 2: SVG DYNAMIC VECTOR CONNECTION LAYER (z-index: 10, pointer-events: none)              |
| - Các đường chỉ dẫn (Leader Lines) vẽ bằng thẻ <path> SVG co giãn mềm mại                    |
| - Chấm phát sáng tại điểm neo 3D (3D Anchor Rings)                                            |
| - Vòng radar sonar quét 2D overlay phụ trợ                                                   |
+-----------------------------------------------------------------------------------------------+
                                                ▲
                                                │ Tọa độ thực trong không gian WebGL
+-----------------------------------------------------------------------------------------------+
| TẦNG 1: WEBGL CANVAS & PROCEDURAL 3D SCENE (z-index: 1, position: fixed, inset: 0)            |
| - Thành phố nguyên khối kim loại sẫm màu vát góc (Chamfered Bevel Monoliths)                  |
| - Custom GLSL Shaders: Radar Sonar Pulse Wave, Photon Highway Beams                          |
| - Bộ đèn 3 điểm Studio Cinematic & Post-Processing (UnrealBloom + ACES Tone Mapping)         |
+-----------------------------------------------------------------------------------------------+
```

### 2.1. Phân Tích Cơ Chế Tương Tác Giữa Các Tầng
1. **Tầng Canvas WebGL (Tầng 1)** hoạt động ở chế độ toàn màn hình (`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh`). Nó không bao giờ bị cuộn trôi đi mà chỉ phản hồi các tham số thời gian và tiến trình cuộn trang từ GSAP ScrollTrigger.
2. **Tầng Dây Nối SVG (Tầng 2)** hoạt động như một cầu nối toán học. Trong mỗi khung hình render (RequestAnimationFrame Loop), vị trí của các đỉnh tháp trong không gian 3D được chuyển đổi thành tọa độ pixel thực trên màn hình bằng phép chiếu ma trận camera. Sau đó, các tọa độ `(x, y)` này được gán trực tiếp vào thuộc tính `d="M x1 y1 L x2 y2"` của thẻ SVG, tạo ra sự liên kết vững chắc không một độ trễ.
3. **Tầng Giao Diện HUD (Tầng 3)** đóng vai trò là lớp tiếp nhận tương tác của người dùng. Để không cản trở khả năng xoay hoặc rê chuột tương tác với canvas 3D bên dưới, toàn bộ container mẹ của tầng này được áp dụng thuộc tính `pointer-events: none`. Chỉ những nút bấm thực tế, thẻ card chi tiết hoặc thanh trượt mới được mở lại quyền tương tác bằng `pointer-events: auto`.

## 3. TOÁN HỌC HÌNH HỌC THỦ TỤC (PROCEDURAL GEOMETRY & MATH)

Để tái hiện lại cảnh quan đô thị kỹ thuật số đỉnh cao như trong thiết kế của **Sigma Software Design** cho NATIX Network (Video 5), các khối kiến trúc không được mô hình hóa bằng tay một cách tùy tiện, mà phải được sinh ra bằng **toán học hình học thủ tục (Procedural Generation)** với các góc vát đa giác (**Chamfered Bevels**) chính xác từng micromet.

### 3.1. Thuật Toán Sinh Đa Giác Vát Cạnh (Chamfered Bevel Extrusion)

Một hình hộp thông thường có 6 mặt chữ nhật và 12 cạnh vuông góc 90 độ. Khi ánh sáng chiếu vào, mặt đón sáng sẽ sáng rực còn mặt bên sẽ tối sầm, ranh giới giữa hai mặt là một đường gấp khúc gắt gỏng không tự nhiên. Để khắc phục, ta biến đổi mặt đáy từ hình chữ nhật 4 cạnh thành một đa giác 8 cạnh với 4 góc bị vát xiên góc 45 độ, sau đó đùn khối (Extrude) với các thông số bevel.

```
              w - 2b
         +--------------+
        /                \
     b /                  \ b
      /                    \
     +                      +
     |                      |
     |                      |  d - 2b
     |                      |
     +                      +
      \                    /
     b \                  / b
        \                /
         +--------------+
              w - 2b
```

#### Mã Nguồn Thuật Toán Chamfered Bevel Hoàn Chỉnh:
```javascript
import * as THREE from "three";

/**
 * Sinh hình học khối kiến trúc vát góc 45 độ chuẩn Awwwards
 * @param {number} width - Chiều rộng đáy (trục X)
 * @param {number} height - Chiều cao tòa tháp (trục Y sau khi xoay)
 * @param {number} depth - Chiều sâu đáy (trục Z)
 * @param {number} bevelSize - Độ vát góc (khoảng 0.1 - 0.25 lần kích thước nhỏ nhất)
 * @returns {THREE.ExtrudeGeometry} Hình học đa giác tối ưu hóa
 */
export function createChamferedMonolithGeometry(width, height, depth, bevelSize) {
  // Giới hạn bevelSize không vượt quá 35% kích thước tối thiểu để tránh lỗi giao cắt cạnh
  const maxBevel = Math.min(width, depth) * 0.35;
  const b = Math.min(bevelSize, maxBevel);
  const hw = width / 2;
  const hd = depth / 2;

  // Khởi tạo Shape 2D với 8 đỉnh vát góc
  const shape = new THREE.Shape();

  // Bắt đầu từ cạnh đáy bên phải
  shape.moveTo(hw - b, -hd);
  // Đỉnh 1: Góc dưới phải
  shape.lineTo(hw, -hd + b);
  // Đỉnh 2: Cạnh phải
  shape.lineTo(hw, hd - b);
  // Đỉnh 3: Góc trên phải
  shape.lineTo(hw - b, hd);
  // Đỉnh 4: Cạnh trên
  shape.lineTo(-hw + b, hd);
  // Đỉnh 5: Góc trên trái
  shape.lineTo(-hw, hd - b);
  // Đỉnh 6: Cạnh trái
  shape.lineTo(-hw, -hd + b);
  // Đỉnh 7: Góc dưới trái
  shape.lineTo(-hw + b, -hd);
  // Khép kín đa giác
  shape.closePath();

  // Thiết lập thông số đùn khối 3D
  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: true,
    bevelThickness: b * 0.8, // Độ sâu vát cạnh theo chiều cao
    bevelSize: b * 0.8,      // Độ mở rộng vát cạnh theo phương ngang
    bevelOffset: 0,
    bevelSegments: 3         // 3 phân đoạn để cạnh vát phản chiếu vệt sáng cong nhẹ
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Đặt tâm xoay về đáy khối và xoay dựng đứng theo trục Y
  geometry.center();
  geometry.translate(0, height / 2, 0);

  // Tính toán lại pháp tuyến (Normals) và tiếp tuyến (Tangents) để bóng đổ mượt mà
  geometry.computeVertexNormals();

  return geometry;
}
```

### 3.2. Thuật Toán Sinh Cao Độ Đô Thị Bằng Simplex Noise (Procedural Urban Heightmap)

Nếu đặt ngẫu nhiên chiều cao của các tòa nhà bằng hàm `Math.random()`, thành phố sẽ trông lộn xộn, thiếu nhịp điệu và không có cấu trúc tự nhiên. Trong các đồ họa đỉnh cao, chiều cao và quy mô của các khối được phân bố dựa trên **hàm nhiễu liên tục (Simplex/Perlin Noise)** kết hợp với **hàm suy giảm khoảng cách (Radial Falloff Function)**:

```
Chiều cao H(x, z) = BaseHeight * [Noise2D(x * Freq, z * Freq) ^ 1.8] * DistanceFalloff(x, z)
```

```javascript
/**
 * Thuật toán tạo ma trận cao độ đô thị hữu cơ có nhịp điệu
 */
export class UrbanMatrixGenerator {
  constructor(gridCols = 16, gridRows = 16, spacing = 4.5) {
    this.cols = gridCols;
    this.rows = gridRows;
    this.spacing = spacing;
  }

  generateCityLayout() {
    const buildings = [];
    const halfW = (this.cols * this.spacing) / 2;
    const halfD = (this.rows * this.spacing) / 2;

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const posX = i * this.spacing - halfW + (Math.random() - 0.5) * 0.4;
        const posZ = j * this.spacing - halfD + (Math.random() - 0.5) * 0.4;

        // Tính khoảng cách từ tâm thành phố
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        const maxRadius = Math.sqrt(halfW * halfW + halfD * halfD);
        const normalizedDist = Math.min(1.0, distFromCenter / maxRadius);

        // Hàm suy giảm theo khoảng cách: Các tòa nhà ở trung tâm cao chọc trời, ở biên thấp dần
        const falloff = Math.pow(1.0 - normalizedDist, 1.4);

        // Giả lập tần số sóng nhiễu đa tầng (Multi-octave noise)
        const wave1 = Math.sin(posX * 0.08) * Math.cos(posZ * 0.08);
        const wave2 = Math.sin(posX * 0.2 + posZ * 0.15) * 0.5;
        const combinedNoise = Math.max(0.05, (wave1 + wave2 + 1.0) * 0.5);

        // Chiều cao tính toán
        const baseHeight = 2.0 + combinedNoise * 18.0 * falloff;

        // Chiều rộng và độ vát góc
        const width = 2.2 + Math.random() * 0.8;
        const depth = 2.2 + Math.random() * 0.8;
        const bevel = 0.25 + Math.random() * 0.15;

        // Xác định xem đây có phải là Trạm Nút Dữ Liệu Quan Trọng (Data Hub Node)
        const isKeyNode = baseHeight > 10.0 && distFromCenter < 18.0;

        buildings.push({
          x: posX,
          z: posZ,
          height: baseHeight,
          width,
          depth,
          bevel,
          isKeyNode,
          gridX: i,
          gridZ: j
        });
      }
    }

    return buildings;
  }
}
```

### 3.3. Rãnh Vi Mạch Bán Dẫn (Circuit Board Trench Grooves)

Giữa các khối nhà không phải là mặt đất phẳng lì rỗng tuếch. Trong video NATIX, mặt sàn là một **mạng lưới bo mạch vi mạch (Circuit Substrate)** với các rãnh chìm có ánh sáng ngầm chạy dọc theo:
- Sàn chính được tạo bằng `PlaneGeometry` với chất liệu kim loại đen nhám mờ (`roughness: 0.85`, `metalness: 0.95`).
- Các rãnh chìm (Trenches) được khắc sâu `0.15 unit` xuống lòng đất, bên trong chứa các dải băng ánh sáng (Light Ribbons) kết nối các tòa tháp.


---

## 4. HỆ THỐNG VẬT LIỆU PBR CHUYÊN SÂU & ÁNH SÁNG STUDIO CINEMATIC

Vật liệu là linh hồn của WebGL. Nếu chọn sai thông số vật liệu, hình ảnh trông sẽ "nhựa", giả tạo và thiếu sức sống.

### 4.1. Bảng Thông Số Vàng Cho Vật Liệu MeshPhysicalMaterial

Three.js cung cấp `MeshPhysicalMaterial` – chuẩn vật liệu PBR (Physically-Based Rendering) cao cấp nhất hiện nay. Dưới đây là bảng thông số vàng được tinh chỉnh qua hàng trăm thử nghiệm đoạt giải:

| Thuộc tính | Giá trị tối ưu | Ý nghĩa vật lý & Hiệu ứng thị giác |
| :--- | :--- | :--- |
| `color` | `0x121620` | Màu kim loại Gunmetal sẫm, pha 2% ánh lam chàm sâu. |
| `metalness` | `0.85` | Tính chất kim loại cao, giúp phản chiếu ánh sáng môi trường. |
| `roughness` | `0.22` | Độ nhám bề mặt vừa phải, tạo vệt sáng phản quang sắc nét nhưng không bị trơ như gương. |
| `clearcoat` | `0.65` | Lớp sơn bóng phủ ngoài, tạo đường viền khúc xạ sắc lẹm trên gờ vát. |
| `clearcoatRoughness` | `0.12` | Độ nhám của lớp sơn bóng ngoài, giữ vệt sáng viền mảnh mai và tinh tế. |
| `reflectivity` | `0.80` | Độ phản xạ ánh sáng phi kim loại tại góc vuông trực diện. |
| `ior` | `1.52` | Chỉ số khúc xạ ánh sáng (Index of Refraction) tương đương thủy tinh quang học cao cấp. |
| `envMapIntensity` | `1.60` | Cường độ hấp thụ ánh sáng từ bản đồ môi trường HDRI xung quanh. |

```javascript
export const CyberneticMonolithMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x121620,
  metalness: 0.85,
  roughness: 0.22,
  clearcoat: 0.65,
  clearcoatRoughness: 0.12,
  reflectivity: 0.80,
  ior: 1.52,
  envMapIntensity: 1.60,
  flatShading: false
});
```

### 4.2. Hệ Thống 3 Nguồn Sáng Studio Cinematic (3-Point Lighting Rig)

Một bức ảnh điện ảnh luôn cần sự tương phản mạnh mẽ giữa vùng sáng và vùng tối (Chiaroscuro). Hãy thiết lập bộ 3 đèn như sau:

```javascript
export function setupCinematicStudioLighting(scene) {
  // 1. KEY LIGHT (Đèn chiếu chính - Tạo khối và bóng đổ dài)
  const keyLight = new THREE.DirectionalLight(0xe8f2ff, 3.2);
  keyLight.position.set(45, 60, 35);
  keyLight.castShadow = true;
  
  // Tối ưu hóa chất lượng bóng đổ (Shadow Quality)
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 10;
  keyLight.shadow.camera.far = 180;
  keyLight.shadow.camera.left = -40;
  keyLight.shadow.camera.right = 40;
  keyLight.shadow.camera.top = 40;
  keyLight.shadow.camera.bottom = -40;
  keyLight.shadow.bias = -0.0001; // Khử hiện tượng sọc bóng đổ (Shadow Acne)
  keyLight.shadow.normalBias = 0.02;
  keyLight.shadow.radius = 2.5;   // Làm mềm viền bóng (Soft Shadows)
  scene.add(keyLight);

  // 2. RIM / BACK LIGHT (Đèn viền phía sau - Tạo vệt sáng rực trên gờ vát)
  const rimLight = new THREE.DirectionalLight(0x70b0ff, 5.0);
  rimLight.position.set(-50, 30, -45);
  scene.add(rimLight);

  // 3. FILL / AMBIENT LIGHT (Đèn bù tối - Giữ độ sâu tương phản)
  const hemiLight = new THREE.HemisphereLight(0x1a2638, 0x05070a, 0.35);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);
  
  return { keyLight, rimLight, hemiLight };
}
```

### 4.3. Kỹ Thuật Nướng Ánh Sáng (Baking Textures) Trong Blender Cho Web 3D 60FPS

Nếu cảnh vật có hàng ngàn đa giác và bạn bật tính toán bóng đổ thời gian thực phức tạp, GPU di động sẽ bị quá nhiệt. Kỹ thuật nướng ánh sáng (**Texture Baking**) là bí quyết tối thượng được Web 3B và Nựccc (Video 2 & 4) sử dụng:
1. **Dựng cảnh trong Blender**: Bố trí đèn Cycles với Ray Tracing đa tầng (Bounces: 8).
2. **Trải UV bản đồ (UV Unwrapping)**: Chọn toàn bộ vật thể kiến trúc, nhấn `U` -> chọn `Smart UV Project` với Margin `0.005`.
3. **Tạo Image Texture Mới**: Đặt tên `baked_diffuse.png`, kích thước `4096 x 4096` pixel (hoặc `2048 x 2048` cho di động), chọn 32-bit Float.
4. **Thiết lập Bake Mode**:
   - Chọn Render Engine: **Cycles** (Compute Device: GPU).
   - Bake Type: **Combined** (hoặc tách riêng **Diffuse** + **Ambient Occlusion**).
   - Bật **Denoise** để khử nhiễu hạt.
5. **Bấm BAKE**: Chờ Blender tính toán toàn bộ vệt sáng, bóng đổ mềm, ánh sáng phản xạ thứ cấp rồi vẽ vào bức ảnh texture.
6. **Tối ưu xuất file WebP**: Nén ảnh `baked_diffuse.png` sang định dạng `.webp` với chất lượng 90% (dung lượng giảm từ 30MB xuống chỉ còn 1.2MB).
7. **Tải vào Three.js**: Gán texture này vào `MeshBasicMaterial({ map: bakedTexture })`. Trình duyệt sẽ hiển thị chất lượng đồ họa tương đương phim hoạt hình Pixar mà không tốn một chút năng lượng tính toán bóng đổ nào!

## 5. LẬP TRÌNH CUSTOM GLSL SHADERS ĐỈNH CAO

Shaders là "vũ khí tối thượng" của các lập trình viên WebGL chuyên nghiệp. Những hiệu ứng như sóng radar quét qua thành phố (Video 5) hay các chùm photon laser truyền tải dữ liệu không thể làm được bằng các vật liệu có sẵn của Three.js.

### 5.1. Shader Sóng Radar Sonar Quét Thành Phố (Radar Sonar Pulse Shader)

Hiệu ứng: Một hình tròn sóng xung kích quét đều đặn từ tâm thành phố ra biên theo chu kỳ thời gian. Tại vị trí đỉnh sóng, màu sắc bừng sáng rực rỡ và mờ dần ra sau.

#### Mã Nguồn Shader Radar Toàn Diện:
```javascript
import * as THREE from "three";

export const RadarPulseShader = {
  uniforms: {
    uTime: { value: 0 },
    uSpeed: { value: 0.3 },        // Tốc độ lan tỏa của sóng
    uWaveWidth: { value: 0.08 },   // Độ dày của dải sóng
    uMaxRadius: { value: 75.0 },   // Bán kính tối đa trước khi tan biến
    uColor: { value: new THREE.Color(0x00f2fe) }, // Màu xanh cyan phát quang
    uOpacity: { value: 0.85 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uWaveWidth;
    uniform float uMaxRadius;
    uniform vec3 uColor;
    uniform float uOpacity;

    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Tính khoảng cách Euclidean từ tâm (0, 0) trên mặt phẳng nằm ngang XZ
      float dist = length(vWorldPosition.xz);

      // Sóng tuần hoàn chạy theo hàm fract
      float waveProgress = fract(uTime * uSpeed);
      float currentRadius = waveProgress * uMaxRadius;

      // Tính toán khoảng cách tương đối tới đỉnh sóng
      float diff = abs(dist - currentRadius);

      // Tạo dải sáng mềm mại bằng smoothstep
      float pulse = smoothstep(uWaveWidth, 0.0, diff);

      // Đuôi sóng mờ dần về phía sau (Trailing effect)
      if (dist < currentRadius) {
        float tail = (dist - (currentRadius - uWaveWidth * 3.0)) / (uWaveWidth * 3.0);
        pulse += max(0.0, tail * 0.35);
      }

      // Độ suy giảm quang học theo khoảng cách xa
      float distanceFade = clamp(1.0 - (dist / uMaxRadius), 0.0, 1.0);

      // Alpha cuối cùng
      float finalAlpha = pulse * distanceFade * uOpacity;

      if (finalAlpha < 0.005) discard; // Tối ưu hóa: Bỏ qua render pixel trong suốt

      gl_FragColor = vec4(uColor, finalAlpha);
    }
  `
};

/**
 * Tạo Mesh đĩa quét Radar
 */
export function createRadarMesh() {
  const geometry = new THREE.PlaneGeometry(160, 160, 1, 1);
  geometry.rotateX(-Math.PI / 2); // Nằm sát trên mặt sàn

  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(RadarPulseShader.uniforms),
    vertexShader: RadarPulseShader.vertexShader,
    fragmentShader: RadarPulseShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending, // Cộng sáng phát quang
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.05;
  return mesh;
}
```

### 5.2. Shader Đường Truyền Dữ Liệu Photon (Photon Highway Spline Laser Shader)

Hiệu ứng: Các đường cong 3D (Spline Tubes) nối giữa các đỉnh tháp dữ liệu. Bên trong ống dây, các hạt photon ánh sáng chạy vun vút với vận tốc cao, đầu nhọn đuôi thon dài:

```javascript
export const PhotonHighwayShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00f2fe) },
    uSpeed: { value: 2.5 },
    uDensity: { value: 8.0 }, // Số lượng gói dữ liệu trên 1 sợi dây
    uPacketLength: { value: 0.15 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uDensity;
    uniform float uPacketLength;

    varying vec2 vUv;

    void main() {
      // Trục U chạy dọc theo chiều dài của đường cong Spline (từ 0.0 đến 1.0)
      float coord = fract(vUv.x * uDensity - uTime * uSpeed);

      // Hạt photon phát sáng mạnh ở đầu và mờ dần về đuôi
      float packet = smoothstep(0.0, 0.03, coord) * smoothstep(uPacketLength, 0.03, coord);

      // Ánh sáng lõi (Core) màu trắng tinh
      vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), packet * 0.7);

      // Đường viền sáng mờ mờ toàn bộ dây cáp để không bị mất kết nối
      float baseGlow = 0.12;
      float alpha = max(baseGlow, packet);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

/**
 * Tạo sợi cáp dữ liệu uốn lượn nối 2 tòa tháp 3D
 */
export function createDataCable(startPoint, endPoint) {
  // Tính toán điểm điều khiển uốn lượn (Arch Control Point)
  const midX = (startPoint.x + endPoint.x) / 2;
  const midZ = (startPoint.z + endPoint.z) / 2;
  const distance = startPoint.distanceTo(endPoint);
  const midY = Math.max(startPoint.y, endPoint.y) + distance * 0.25; // Càng xa càng võng cao

  const curve = new THREE.CatmullRomCurve3([
    startPoint,
    new THREE.Vector3(midX, midY, midZ),
    endPoint
  ]);

  const geometry = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(PhotonHighwayShader.uniforms),
    vertexShader: PhotonHighwayShader.vertexShader,
    fragmentShader: PhotonHighwayShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Mesh(geometry, material);
}
```

### 5.3. Shader Lưới Hologram Vô Tận Chống Răng Cưa (Infinite Anti-Aliased Grid)

Để không phải tải một ảnh texture lưới nặng nề và bị vỡ hạt ở đường chân trời, ta viết trực tiếp một **Procedural Anti-Aliased Grid Shader** sử dụng hàm đạo hàm màn hình `fwidth()`:

```javascript
export const InfiniteGridShader = {
  vertexShader: `
    varying vec3 vWorldPos;
    void main() {
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPos;
    uniform float uGridSize;
    uniform vec3 uGridColor;
    uniform vec3 uAxisColor;

    void main() {
      vec2 coord = vWorldPos.xz / 2.0; // Kích thước ô lưới 2x2 đơn vị
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(grid.x, grid.y);
      float c = 1.0 - min(line, 1.0);

      // Suy giảm về phía đường chân trời
      float dist = length(vWorldPos.xz);
      float fade = clamp(1.0 - dist / 90.0, 0.0, 1.0);

      vec3 color = mix(vec3(0.02, 0.04, 0.08), uGridColor, c);
      gl_FragColor = vec4(color, fade * 0.45);
    }
  `
};
```


---

## 6. BỘ XỬ LÝ HẬU KỲ (POST-PROCESSING & CINEMATIC FX PIPELINE)

Post-processing là bước biến đồ họa 3D khô khan thành một khung cảnh điện ảnh rực rỡ có hồn. Nếu không có bước này, các tia laser và ánh đèn phát sáng (Emissive) sẽ chỉ là những vệt màu xơ xác.

### 6.1. Thiết Lập Bộ Pipeline EffectComposer Đạt Chuẩn

```javascript
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

export function initPostProcessingPipeline(renderer, scene, camera) {
  // 1. Cấu hình Renderer chuẩn điện ảnh
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 2. Tạo Render Target có độ sâu màu 16-bit Float để tránh hiện tượng dải màu (Color Banding)
  const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      type: THREE.HalfFloatType,
      samples: 4 // Bật khử răng cưa đa mẫu (MSAA 4x)
    }
  );

  const composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(new RenderPass(scene, camera));

  // 3. UnrealBloomPass: Quầng phát sáng cho Laser và Đèn Node
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.35,  // Cường độ Bloom (Strength) - Đủ rực rỡ nhưng không làm lóa mắt
    0.45,  // Bán kính hào quang (Radius)
    0.82   // Ngưỡng độ sáng (Threshold) - Chỉ những vật thể sáng trên 82% mới phát quang
  );
  composer.addPass(bloomPass);

  // 4. Custom Film Grain & Vignette Pass: Tạo cảm giác ống kính điện ảnh thực tế
  const filmicShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uGrainIntensity: { value: 0.04 },
      uVignetteDarkness: { value: 1.1 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uGrainIntensity;
      uniform float uVignetteDarkness;
      varying vec2 vUv;

      // Hàm tạo hạt nhiễu giả ngẫu nhiên (Pseudo-random noise)
      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);

        // Thêm hạt nhiễu Film Grain
        float noise = (rand(vUv + fract(uTime)) - 0.5) * uGrainIntensity;
        color.rgb += noise;

        // Hiệu ứng tối góc ống kính (Vignette)
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        float vignette = smoothstep(0.8, 0.2, dist * uVignetteDarkness);
        color.rgb *= vignette;

        gl_FragColor = color;
      }
    `
  };

  const filmicPass = new ShaderPass(filmicShader);
  composer.addPass(filmicPass);

  return { composer, bloomPass, filmicPass };
}
```

## 7. HỆ THỐNG ĐIỀU KHIỂN CAMERA & ĐỒNG BỘ CUỘN TRANG (GSAP + LENIS)

Sự mượt mà của chuyển động là yếu tố phân tách lớn nhất giữa trang web thường và trang web đoạt giải Awwwards. Chuột người dùng chỉ cuộn từng nấc, nhưng camera 3D phải lướt như một thiết bị bay không người lái (Cinematic Drone) với quán tính vật lý.

### 7.1. Cấu Hình Hoàn Hảo Cho Lenis Smooth Scroll

```javascript
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLenisSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.35,            // Thời gian hãm quán tính (giây)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Đường cong gia tốc Exponential Ease-Out
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    smoothTouch: false,        // Tắt trên cảm ứng để giữ hành vi cuộn gốc của mobile
    touchMultiplier: 2.0
  });

  // Đồng bộ Lenis với GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0); // Tắt lag smoothing để tránh giật frame khi tab đổi trạng thái

  return lenis;
}
```

### 7.2. Quỹ Đạo Bay CatmullRom Curve & Ghim Phân Cảnh (Section Pinning)

Thay vì dịch chuyển camera theo các đoạn thẳng cụt lủn, toàn bộ hành trình được định nghĩa bằng một **Đường cong Spline 3 chiều mượt mà (3D Catmull-Rom Spline)** xuyên qua 5 trạm mốc của UniSynapse:

```javascript
export function setupCinematicCameraRig(camera, cameraTarget) {
  // 5 Trạm mốc tương ứng 5 phân cảnh của UniSynapse
  const waypoints = [
    {
      id: "hero",
      camPos: new THREE.Vector3(0, 14, 32),
      target: new THREE.Vector3(0, 2, 0),
      title: "ĐẠI ĐÔ THỊ TRI THỨC TOÀN CẦU",
      telemetry: "LAT: 37.7749° N • LNG: 122.4194° W • BFT: 80.4%"
    },
    {
      id: "labeling",
      camPos: new THREE.Vector3(12, 5, 8),
      target: new THREE.Vector3(8, 2.5, -2),
      title: "TRẠM TÁC VỤ GÁN NHÃN DỮ LIỆU AI",
      telemetry: "ACTIVE TASKS: 42 • REWARD: +250 UP • CONSENSUS: 99.2%"
    },
    {
      id: "tunnel",
      camPos: new THREE.Vector3(-10, 4, -12),
      target: new THREE.Vector3(0, 2, -22),
      title: "ĐƯỜNG HẦM KIỂM ĐỊNH AN NINH 6 CỔNG",
      telemetry: "PII SANITIZED • SHA-256 VERIFIED • 30 UNI NODES"
    },
    {
      id: "ledger",
      camPos: new THREE.Vector3(6, 6, -18),
      target: new THREE.Vector3(0, 3, -16),
      title: "KHO KÉT THANH KHOẢN SOLANA DEVNET",
      telemetry: "DISBURSEMENT: 3.2s • SMART CONTRACT: EXECUTED"
    },
    {
      id: "command",
      camPos: new THREE.Vector3(0, 18, 20),
      target: new THREE.Vector3(0, 0, -5),
      title: "BÀN ĐIỀU KHIỂN TRUNG TÂM MASTER SUITE",
      telemetry: "SYSTEM READY • CONNECT PHANTOM WALLET TO PARTICIPATE"
    }
  ];

  // Tạo đường cong Spline nội suy vị trí camera và điểm nhìn (LookAt)
  const camCurve = new THREE.CatmullRomCurve3(waypoints.map(w => w.camPos));
  const targetCurve = new THREE.CatmullRomCurve3(waypoints.map(w => w.target));

  // Khởi tạo GSAP Timeline gắn với ScrollTrigger
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#web3d-scroll-track",
      start: "top top",
      end: "+=5000",       // Tổng chiều dài cuộn 5000px
      scrub: 1.2,          // Độ trễ quán tính 1.2 giây
      pin: "#viewport-fixed-container", // Ghim chặt màn hình không cho trôi
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 -> 1.0
        
        // Cập nhật vị trí camera dọc theo đường cong CatmullRom
        const currentPos = camCurve.getPoint(progress);
        const currentTarget = targetCurve.getPoint(progress);

        camera.position.copy(currentPos);
        cameraTarget.copy(currentTarget);
        camera.lookAt(cameraTarget);

        // Cập nhật giao diện HUD Telemetry theo tiến độ phân cảnh
        const stepIndex = Math.min(4, Math.floor(progress * 5));
        const activeWp = waypoints[stepIndex];
        
        const titleEl = document.getElementById("hud-scene-title");
        const telemetryEl = document.getElementById("hud-scene-telemetry");
        if (titleEl && titleEl.textContent !== activeWp.title) {
          titleEl.textContent = activeWp.title;
          telemetryEl.textContent = activeWp.telemetry;
        }
      }
    }
  });

  return { timeline, waypoints, camCurve, targetCurve };
}
```


---

## 8. TƯƠNG TÁC KHÔNG GIAN & ĐỊNH VỊ TỌA ĐỘ 3D SANG 2D (HOTSPOT TRACKING)

Kỹ thuật đỉnh cao từ video Cybertruck (Video 6) và NATIX (Video 5): Một điểm neo phát sáng ghim chặt vào đỉnh tháp 3D trong không gian, từ đó bắn ra một đường chỉ dẫn SVG (Leader Line) nối thẳng vào thẻ HTML lơ lửng.

### 8.1. Toán Học Chiếu Điểm Neo 3D Sang Màn Hình 2D (Vector3 Projection)

```javascript
/**
 * Chuyển đổi tọa độ thế giới 3D (World Space) sang tọa độ pixel màn hình (Screen Space)
 * @param {THREE.Vector3} worldPos - Tọa độ 3D của vật thể
 * @param {THREE.Camera} camera - Camera phối cảnh
 * @returns {{x: number, y: number, isVisible: boolean}} Tọa độ pixel và trạng thái nhìn thấy
 */
export function project3DToScreen(worldPos, camera) {
  const vector = worldPos.clone();
  
  // Nhân ma trận View Matrix và Projection Matrix
  vector.project(camera);

  // Kiểm tra xem vật thể có nằm phía sau camera hay không (Z > 1 là nằm ngoài Frustum)
  const isVisible = vector.z < 1.0 && vector.x >= -1.1 && vector.x <= 1.1 && vector.y >= -1.1 && vector.y <= 1.1;

  // Chuyển đổi từ tọa độ chuẩn hóa NDC (-1.0 đến +1.0) sang tọa độ pixel thực tế
  const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const screenY = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

  return { x: screenX, y: screenY, isVisible };
}
```

### 8.2. Vẽ Dây Nối SVG Co Giãn Động Theo Góc Nhìn Camera (Dynamic SVG Leader Lines)

```javascript
export class HotspotSystem {
  constructor(camera, svgContainerId) {
    this.camera = camera;
    this.svg = document.getElementById(svgContainerId);
    this.hotspots = [];
  }

  addHotspot(id, worldPos, cardDomId, offsetX = 140, offsetY = -60) {
    this.hotspots.push({
      id,
      worldPos,
      card: document.getElementById(cardDomId),
      path: document.createElementNS("http://www.w3.org/2000/svg", "path"),
      circle: document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      offsetX,
      offsetY
    });

    const last = this.hotspots[this.hotspots.length - 1];
    last.path.setAttribute("class", "hotspot-leader-line");
    last.path.setAttribute("stroke", "rgba(0, 242, 254, 0.65)");
    last.path.setAttribute("stroke-width", "1.5");
    last.path.setAttribute("fill", "none");
    last.path.setAttribute("stroke-dasharray", "4 2");

    last.circle.setAttribute("r", "4");
    last.circle.setAttribute("fill", "#00f2fe");

    this.svg.appendChild(last.path);
    this.svg.appendChild(last.circle);
  }

  update() {
    for (const h of this.hotspots) {
      const { x, y, isVisible } = project3DToScreen(h.worldPos, this.camera);

      if (!isVisible) {
        h.card.style.opacity = "0";
        h.path.style.opacity = "0";
        h.circle.style.opacity = "0";
        continue;
      }

      h.card.style.opacity = "1";
      h.path.style.opacity = "1";
      h.circle.style.opacity = "1";

      // Điểm neo 3D
      h.circle.setAttribute("cx", x);
      h.circle.setAttribute("cy", y);

      // Vị trí của thẻ thông tin HTML
      const cardX = x + h.offsetX;
      const cardY = y + h.offsetY;
      h.card.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`;

      // Vẽ đường gấp khúc hiện đại: Từ điểm neo (x, y) -> bẻ góc ngang -> chạm mép thẻ card
      const elbowX = x + (h.offsetX * 0.4);
      const pathData = `M ${x} ${y} L ${elbowX} ${cardY} L ${cardX} ${cardY}`;
      h.path.setAttribute("d", pathData);
    }
  }
}
```

### 8.3. Con Trỏ Chuột Từ Tính (Magnetic Reticle) & Nghiêng Camera Theo Chuột

```javascript
export function initMagneticCursorAndTilt(camera) {
  const cursor = document.getElementById("custom-cursor");
  const follower = document.getElementById("cursor-follower");

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let tiltX = 0, tiltY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Tính toán góc nghiêng Camera tương đối (-0.5 đến +0.5)
    tiltX = (e.clientX / window.innerWidth - 0.5) * 2.0;
    tiltY = (e.clientY / window.innerHeight - 0.5) * 2.0;
  });

  // Vòng lặp cập nhật chuyển động mượt (Lerp loop)
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    if (cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    
    // Tác động lực nghiêng vi mô lên Camera
    camera.rotation.x += (tiltY * 0.04 - camera.rotation.x) * 0.05;
    camera.rotation.y += (-tiltX * 0.04 - camera.rotation.y) * 0.05;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}
```

## 9. HỆ THỐNG ÂM THANH KHÔNG GIAN WEB AUDIO FOLEY

Âm thanh là 50% cảm xúc của một trải nghiệm kỹ thuật số. Tuy nhiên, tải các file `.mp3` nặng nề sẽ làm chậm trang web và vi phạm chính sách tự động phát (Autoplay Policy) của trình duyệt. **Web Audio API** cho phép chúng ta tổng hợp âm thanh tương tác trực tiếp bằng các bộ dao động sóng (Oscillators) mà không tốn một kilobyte băng thông nào.

### 9.1. Lớp Bộ Tổng Hợp Âm Thanh Không Gian (SpatialFoleyEngine)

```javascript
/**
 * Bộ tổng hợp âm thanh Foley thuần túy bằng Web Audio API
 */
export class SpatialFoleyEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Mặc định tắt tiếng cho đến khi người dùng tương tác
    this.droneGain = null;
  }

  // Khởi tạo AudioContext khi người dùng click lần đầu
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.startSubBassDrone();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.droneGain) {
      this.droneGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.05,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  // 1. Tiếng rung trầm sâu thẳm của động cơ lượng tử (42Hz Sub-bass Drone)
  startSubBassDrone() {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.droneGain = this.ctx.createGain();

    // Tần số trầm cơ bản 42Hz
    osc.type = "sine";
    osc.frequency.setValueAtTime(42, this.ctx.currentTime);

    // LFO điều tần chậm 0.2Hz tạo cảm giác "hơi thở" của máy chủ
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(3.0, this.ctx.currentTime);

    lfo.connect(osc.frequency);
    this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);

    osc.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    osc.start();
    lfo.start();
  }

  // 2. Tiếng click cơ học siêu nhỏ khi hover chuột vào nút hoặc thẻ
  playMechanicalClick() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 3. Tiếng Radar Ping ngân vang khi sóng quét qua các tòa tháp
  playRadarPing() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.75);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  // 4. Tiếng xáo trộn dữ liệu (Telemetry Data Noise Burst)
  playDataBurst() {
    if (this.isMuted || !this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms nhiễu trắng
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }
}
```


---

## 10. HỆ THỐNG GIAO DIỆN HUD TELEMETRY, BENTO GRID 2.0 & SWISS TYPOGRAPHY

### 10.1. Hệ Thống Design Tokens CSS Đạt Chuẩn Awwwards

```css
:root {
  /* Bảng màu Cybernetic Obsidian */
  --bg-void: #040508;
  --bg-surface: rgba(10, 14, 24, 0.75);
  --bg-surface-hover: rgba(18, 24, 40, 0.85);
  
  --metal-dark: #121620;
  --metal-chamfer: #1e2638;
  
  --accent-cyan: #00f2fe;
  --accent-ice: #8ec5fc;
  --accent-solana: #9945ff;
  --accent-emerald: #00f5a0;
  
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-muted: rgba(255, 255, 255, 0.28);
  
  /* Typography Thụy Sĩ */
  --font-display: "Syne", "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", "Courier New", monospace;
  
  /* Glassmorphism & Hiệu Ứng Viền Gradient */
  --glass-blur: blur(20px);
  --border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --border-glow: 1px solid rgba(0, 242, 254, 0.35);
}
```

### 10.2. Cấu Trúc Khung Bento Grid 2.0 Tích Hợp WebGL

```html
<!-- Bento Grid 2.0 Bán Trong Suốt Đè Lên 3D -->
<section class="bento-container" id="bento-matrix">
  <!-- Card 1: Live Telemetry BFT -->
  <article class="bento-card col-span-2">
    <div class="card-header">
      <span class="live-dot animate-pulse"></span>
      <span class="card-tag">ĐỒNG THUẬN BFT 80%</span>
    </div>
    <div class="card-metric">
      <span class="counter-number">99.82</span>
      <span class="counter-unit">%</span>
    </div>
    <p class="card-desc">30 nút đại học phân tán đang kiểm định tài liệu với mã hóa SHA-256 thời gian thực.</p>
    <div class="sparkline-bar">
      <span style="height: 40%"></span>
      <span style="height: 65%"></span>
      <span style="height: 85%"></span>
      <span style="height: 100%"></span>
      <span style="height: 70%"></span>
    </div>
  </article>

  <!-- Card 2: Kho Két Solana Devnet -->
  <article class="bento-card col-span-1">
    <div class="card-header">
      <span class="card-icon solana-icon">◈</span>
      <span class="card-tag">SOLANA SETTLEMENT</span>
    </div>
    <div class="card-metric text-solana">
      <span class="counter-number">3.2</span>
      <span class="counter-unit">SEC</span>
    </div>
    <p class="card-desc">Giải ngân tự động học bổng UP Token ngay sau khi hoàn thành nhiệm vụ.</p>
  </article>
</section>
```

## 11. TỐI ƯU HÓA HIỆU NĂNG 60FPS TUYỆT ĐỐI & MOBILE ENGINEERING

Một trang web dù đẹp đến đâu nhưng nếu bị giật lag dưới 30FPS hoặc làm nóng máy người dùng thì sẽ bị đánh giá là thất bại. Dưới đây là kỹ thuật kiến trúc tối ưu hóa bắt buộc cho các dự án Web 3D chuẩn Awwwards:

### 11.1. Kiến Trúc InstancedMesh (Hàng Ngàn Khối Nhà Chỉ Tốn 1 Draw Call)

Thay vì gọi `scene.add(new THREE.Mesh(...))` hàng ngàn lần (làm GPU nghẽn cổ chai với hàng ngàn lệnh vẽ riêng biệt), ta sử dụng `THREE.InstancedMesh`. Toàn bộ các khối nhà có cùng loại hình học sẽ được gửi sang GPU trong 1 lệnh vẽ duy nhất, vị trí và tỷ lệ của từng khối được kiểm soát bằng một ma trận ma trận 4x4 (`THREE.Matrix4`):

```javascript
import * as THREE from "three";
import { createChamferedMonolithGeometry, CyberneticMonolithMaterial } from "./procedural.js";

export function createOptimizedMegacityInstanced(buildingDataList) {
  const count = buildingDataList.length;
  // Sử dụng một hình học cơ sở chuẩn hóa (Unit Geometry: 1x1x1)
  const baseGeometry = createChamferedMonolithGeometry(1.0, 1.0, 1.0, 0.15);
  
  const instancedMesh = new THREE.InstancedMesh(
    baseGeometry,
    CyberneticMonolithMaterial,
    count
  );

  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const b = buildingDataList[i];

    // Định vị tọa độ, góc xoay và tỷ lệ co giãn
    dummy.position.set(b.x, 0, b.z);
    dummy.scale.set(b.width, b.height, b.depth);
    dummy.rotation.y = (Math.random() > 0.5 ? 0 : Math.PI * 0.5); // Xoay ngẫu nhiên 90 độ
    dummy.updateMatrix();

    // Cập nhật ma trận biến đổi vào InstancedMesh
    instancedMesh.setMatrixAt(i, dummy.matrix);

    // Đổi sắc thái màu tinh tế giữa các tòa nhà
    if (b.isKeyNode) {
      color.setHex(0x1a2436); // Đỉnh tháp dữ liệu quan trọng sáng hơn
    } else {
      const shade = 0.06 + Math.random() * 0.04;
      color.setRGB(shade, shade * 1.1, shade * 1.3);
    }
    instancedMesh.setColorAt(i, color);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

  return instancedMesh;
}
```

### 11.2. Giải Phóng Bộ Nhớ WebGL & Ngăn Ngừa Lỗi WebGL Context Lost

Khi người dùng chuyển tab hoặc rời trang, các tài nguyên WebGL (Geometry, Material, Texture, RenderTarget) vẫn chiếm giữ bộ nhớ VRAM nếu không được hủy bỏ thủ công:

```javascript
export function disposeSceneResources(scene, renderer, composer) {
  scene.traverse((object) => {
    if (!object.isMesh) return;

    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(m => disposeMaterial(m));
      } else {
        disposeMaterial(object.material);
      }
    }
  });

  if (composer) composer.dispose();
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}

function disposeMaterial(mat) {
  mat.dispose();
  for (const key of Object.keys(mat)) {
    const value = mat[key];
    if (value && typeof value === "object" && "minFilter" in value) {
      value.dispose(); // Hủy texture map
    }
  }
}
```


---

## 12. MẪU TRIỂN KHAI HOÀN CHỈNH ĐỘC LẬP (FULL STANDALONE PRODUCTION TEMPLATE)

Dưới đây là mã nguồn của một trang web độc lập hoàn chỉnh 100% (`standalone-production-web3d.html`), chứa toàn bộ các kỹ thuật tinh hoa nói trên. Bạn có thể lưu lại và mở trực tiếp trên trình duyệt mà không cần cài đặt thêm bất kỳ công cụ nào:

```html
<!DOCTYPE html>
<html lang="vi" class="h-full bg-[#040508] text-white">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UniSynapse 3D — Decentralized Knowledge Grid</title>

  <!-- Google Fonts: Syne, Space Grotesk & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <!-- CDN Thư viện cần thiết -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #040508;
      color: #ffffff;
      font-family: "Space Grotesk", sans-serif;
      overflow-x: hidden;
    }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    .font-syne { font-family: "Syne", sans-serif; }

    /* Fixed 3D Viewport */
    #canvas-container {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 1;
      pointer-events: none;
    }
    #webgl-canvas { width: 100%; height: 100%; display: block; }

    /* SVG Leader Lines */
    #svg-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 5;
      pointer-events: none;
    }

    /* HUD Overlay */
    .hud-layer {
      position: fixed;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2rem;
    }
    .interactive { pointer-events: auto; }

    /* Glassmorphism Card */
    .hud-glass {
      background: rgba(10, 14, 24, 0.72);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }

    /* Dynamic Hotspot Card */
    .hotspot-card {
      position: absolute;
      top: 0; left: 0;
      background: rgba(8, 12, 22, 0.85);
      border: 1px solid rgba(0, 242, 254, 0.4);
      backdrop-filter: blur(16px);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      pointer-events: auto;
      transition: opacity 0.3s ease;
      will-change: transform, opacity;
    }

    /* Scroll Spacer Track */
    #scroll-track {
      position: relative;
      height: 500vh; /* Tạo không gian cuộn 5 phân cảnh */
      z-index: 2;
    }

    /* Custom Cursor */
    #reticle-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 32px; height: 32px;
      border: 1px solid rgba(0, 242, 254, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 100;
      transform: translate(-50%, -50%);
      transition: width 0.2s, height 0.2s, border-color 0.2s;
    }
    #reticle-dot {
      position: fixed;
      top: 0; left: 0;
      width: 4px; height: 4px;
      background: #00f2fe;
      border-radius: 50%;
      pointer-events: none;
      z-index: 101;
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>

  <div id="reticle-cursor"></div>
  <div id="reticle-dot"></div>

  <!-- 3D Canvas Viewport -->
  <div id="canvas-container">
    <canvas id="webgl-canvas"></canvas>
  </div>

  <!-- SVG Hotspot Leader Lines -->
  <svg id="svg-overlay"></svg>

  <!-- Interactive Hotspot Cards -->
  <div id="hotspot-card-1" class="hotspot-card font-mono text-xs" style="opacity: 0;">
    <div style="color: #00f2fe; font-weight: bold; margin-bottom: 4px;">NODE #01 // THÁP TRI THỨC</div>
    <div style="color: #94a3b8;">150 TRIỆU BỘ ĐỀ SỐ HÓA</div>
    <div style="color: #00f5a0; margin-top: 4px;">+250 UP PHẦN THƯỞNG</div>
  </div>

  <!-- Telemetry HUD Overlay -->
  <div class="hud-layer">
    <!-- Header -->
    <header style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="hud-glass interactive">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #00f5a0; box-shadow: 0 0 10px #00f5a0;"></span>
          <h1 class="font-syne" style="font-size: 1rem; font-weight: 800; letter-spacing: 0.05em;">UNISYNAPSE PROTOCOL</h1>
        </div>
        <p class="font-mono" style="font-size: 0.7rem; color: #00f2fe;">DECENTRALIZED AI KNOWLEDGE GRID</p>
      </div>

      <div class="hud-glass interactive" style="display: flex; gap: 12px; align-items: center;">
        <button id="audio-toggle" class="font-mono" style="background: rgba(0,242,254,0.1); border: 1px solid rgba(0,242,254,0.3); color: #00f2fe; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
          SFX: OFF
        </button>
        <button class="font-mono" style="background: #00f2fe; color: #040508; font-weight: bold; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
          CONNECT WALLET
        </button>
      </div>
    </header>

    <!-- Footer Live Telemetry -->
    <footer style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div class="hud-glass">
        <div class="font-mono text-xs" style="color: #94a3b8;" id="hud-telemetry-coords">
          LAT: 37.7749° N • LNG: 122.4194° W • BFT: 80.4%
        </div>
        <div class="font-syne" style="font-size: 1.25rem; font-weight: bold; margin-top: 4px; color: #ffffff;" id="hud-scene-title">
          ĐẠI ĐÔ THỊ TRI THỨC TOÀN CẦU
        </div>
      </div>
    </footer>
  </div>

  <!-- Scroll Spacer -->
  <div id="scroll-track"></div>

  <script>
    // Khởi tạo Audio Foley Engine
    class FoleyEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = true;
      }
      init() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === "suspended") this.ctx.resume();
      }
      toggle() {
        this.init();
        this.isMuted = !this.isMuted;
        return this.isMuted;
      }
      click() {
        if (this.isMuted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.03);
      }
    }
    const audio = new FoleyEngine();

    document.getElementById("audio-toggle").addEventListener("click", () => {
      const muted = audio.toggle();
      document.getElementById("audio-toggle").textContent = muted ? "SFX: OFF" : "SFX: ON";
      audio.click();
    });

    // Lenis Smooth Scroll
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Three.js Scene Setup
    const canvas = document.getElementById("webgl-canvas");
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040508, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 14, 30);
    const cameraTarget = new THREE.Vector3(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Ánh sáng Studio 3 điểm
    const keyLight = new THREE.DirectionalLight(0xe8f2ff, 3.0);
    keyLight.position.set(40, 50, 30);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70b0ff, 4.5);
    rimLight.position.set(-40, 25, -40);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x1a2638, 0x040508, 0.3);
    scene.add(hemiLight);

    // Procedural Chamfered Box Generation
    function createChamferBox(w, h, d, b) {
      const s = new THREE.Shape();
      const hw = w/2, hd = d/2;
      s.moveTo(hw - b, -hd); s.lineTo(hw, -hd + b); s.lineTo(hw, hd - b); s.lineTo(hw - b, hd);
      s.lineTo(-hw + b, hd); s.lineTo(-hw, hd - b); s.lineTo(-hw, -hd + b); s.lineTo(-hw + b, -hd);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: b*0.8, bevelSize: b*0.8, bevelSegments: 2 });
      g.center(); g.translate(0, h/2, 0);
      return g;
    }

    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: 0x121620, metalness: 0.85, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.12
    });

    // Dựng cụm thành phố Procedural
    const buildings = [];
    for (let x = -6; x <= 6; x++) {
      for (let z = -6; z <= 6; z++) {
        const dist = Math.sqrt(x*x + z*z);
        if (dist > 7) continue;
        const h = Math.max(1.5, (1.0 - dist/7.5) * 14.0 * (Math.sin(x*0.5)*Math.cos(z*0.5)*0.5 + 0.6));
        const geom = createChamferBox(2.2, h, 2.2, 0.25);
        const mesh = new THREE.Mesh(geom, monolithMat);
        mesh.position.set(x * 3.8, 0, z * 3.8);
        scene.add(mesh);
        buildings.push(mesh);
      }
    }

    // Đỉnh tháp chính làm Hotspot
    const hotspotWorldPos = new THREE.Vector3(0, 14.5, 0);

    // Sóng Radar Sonar Shader
    const radarGeom = new THREE.PlaneGeometry(100, 100);
    radarGeom.rotateX(-Math.PI / 2);
    const radarMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec3 vPos; void main() { vPos = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0); }`,
      fragmentShader: `uniform float uTime; varying vec3 vPos; void main() {
        float dist = length(vPos.xz);
        float wave = fract(dist * 0.03 - uTime * 0.4);
        float ring = smoothstep(0.92, 1.0, wave) * (1.0 - smoothstep(0.0, 0.08, wave));
        float fade = clamp(1.0 - dist / 50.0, 0.0, 1.0);
        gl_FragColor = vec4(0.0, 0.95, 1.0, ring * fade * 0.9);
      }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const radarMesh = new THREE.Mesh(radarGeom, radarMat);
    radarMesh.position.y = 0.05;
    scene.add(radarMesh);

    // Post-Processing UnrealBloom
    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.25, 0.4, 0.82);
    composer.addPass(bloom);

    // GSAP ScrollTrigger CatmullRom Path
    const camWaypoints = [
      new THREE.Vector3(0, 14, 30),
      new THREE.Vector3(12, 6, 10),
      new THREE.Vector3(-10, 4, -10),
      new THREE.Vector3(6, 6, -18),
      new THREE.Vector3(0, 18, 20)
    ];
    const curve = new THREE.CatmullRomCurve3(camWaypoints);

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: "#scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        const pos = curve.getPoint(p);
        camera.position.copy(pos);
        camera.lookAt(cameraTarget);
      }
    });

    // Hotspot 3D-to-2D Projection & Leader Line
    const svgOverlay = document.getElementById("svg-overlay");
    const card = document.getElementById("hotspot-card-1");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "rgba(0, 242, 254, 0.65)");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "4 2");
    svgOverlay.appendChild(path);

    function updateHotspot() {
      const v = hotspotWorldPos.clone().project(camera);
      if (v.z > 1.0) { card.style.opacity = "0"; path.style.opacity = "0"; return; }
      card.style.opacity = "1"; path.style.opacity = "1";
      const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-(v.y * 0.5) + 0.5) * window.innerHeight;
      const cx = sx + 120, cy = sy - 40;
      card.style.transform = `translate(${cx}px, ${cy}px)`;
      path.setAttribute("d", `M ${sx} ${sy} L ${sx + 60} ${cy + 15} L ${cx} ${cy + 15}`);
    }

    // Con trỏ chuột
    const cur = document.getElementById("reticle-cursor");
    const dot = document.getElementById("reticle-dot");
    window.addEventListener("mousemove", (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      gsap.to(cur, { x: e.clientX, y: e.clientY, duration: 0.25 });
    });

    // Render Loop
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      radarMat.uniforms.uTime.value = t;
      updateHotspot();
      composer.render();
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```


---

## 13. BẢNG KIỂM ĐỊNH KỸ THUẬT 50 TIÊU CHÍ TRƯỚC KHI XUẤT XƯỞNG (PRODUCTION CHECKLIST)

Trước khi xuất bản bất kỳ trang Web 3D nào ra môi trường production, Kỹ sư trưởng bắt buộc phải đối soát đầy đủ 50 tiêu chí dưới đây:

### Nhóm A: Tiêu Chuẩn Thẩm Mỹ & Đồ Họa Điện Ảnh (10 Tiêu Chí)
1. [ ] Đã loại bỏ hoàn toàn các hình học thô sơ 90 độ, thay thế 100% bằng hình khối vát góc Chamfered Bevel.
2. [ ] Bảng màu tuân thủ nghiêm ngặt Cybernetic Obsidian, không có màu bão hòa rẻ tiền.
3. [ ] Đầy đủ bộ 3 đèn Studio: Key Light (bóng đổ mềm), Rim Light (phản quang viền) và Fill Light tương phản.
4. [ ] Bật `ACESFilmicToneMapping` và đặt `exposure` trong khoảng 1.1 - 1.25.
5. [ ] Đã thiết lập `outputColorSpace = THREE.SRGBColorSpace` để màu sắc hiển thị trung thực.
6. [ ] Cấu hình UnrealBloomPass với ngưỡng threshold cao (>= 0.8) để tránh làm lóa toàn màn hình.
7. [ ] Thêm một lớp Film Grain mỏng mịn (cường độ <= 0.04) để khử triệt để hiện tượng dải màu Color Banding.
8. [ ] Nền trang web sử dụng màu đen sắc chàm sâu `#040508` thay vì đen tuyền `#000000`.
9. [ ] Các cạnh kim loại bắt sáng Specular Highlight rõ nét khi camera di chuyển.
10. [ ] Có sương mù quang học `FogExp2` tạo cảm giác xa xăm huyền bí ở đường chân trời.

### Nhóm B: Hiệu Năng & Tối Ưu Hóa 60FPS (10 Tiêu Chí)
11. [ ] Toàn bộ các tòa nhà / linh kiện lặp lại được gom vào `InstancedMesh`, giữ Draw Calls < 40.
12. [ ] Giới hạn tỷ lệ điểm ảnh `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` để tránh đơ màn hình Retina 4K.
13. [ ] Bật `shadow.bias = -0.0001` để khử hoàn toàn hiện tượng sọc bóng đổ (Shadow Acne).
14. [ ] Kích thước Shadow Map không vượt quá `2048x2048` trên máy tính và hạ xuống `1024x1024` trên di động.
15. [ ] Các shader trong suốt (`transparent: true`) đều có lệnh `if (alpha < 0.01) discard;` để GPU không tốn tài nguyên render.
16. [ ] Các đường dẫn texture được nén sang định dạng `.webp` hoặc `.ktx2` dung lượng dưới 1.5MB.
17. [ ] Có cơ chế dọn dẹp bộ nhớ `disposeSceneResources` khi unmount component trong Next.js/React.
18. [ ] Đảm bảo chỉ số FPS duy trì liên tục trên 58FPS trong các phân cảnh bay camera phức tạp.
19. [ ] Shader không chứa các vòng lặp tính toán lồng nhau nặng nề trong Fragment Shader.
20. [ ] Bật `powerPreference: "high-performance"` trong thuộc tính khởi tạo WebGLRenderer.

### Nhóm C: Chuyển Động & Trải Nghiệm Cuộn Trang (10 Tiêu Chí)
21. [ ] Đã tích hợp Lenis Smooth Scroll, loại bỏ 100% hiện tượng giật cục của chuột.
22. [ ] Camera di chuyển dọc theo đường cong CatmullRom mượt mà, không bị gấp khúc tại các trạm mốc.
23. [ ] Thuộc tính `scrub` của GSAP ScrollTrigger được đặt từ 1.0 đến 1.4 giây để tạo cảm giác trôi điện ảnh.
24. [ ] Kỹ thuật Section Pinning ghim chặt màn hình trong suốt hành trình kể chuyện 5 phân cảnh.
25. [ ] Có hiệu ứng nghiêng nhẹ camera (3D Tilt Parallax) theo vị trí con trỏ chuột.
26. [ ] Tắt hiệu ứng cuộn mượt giả lập trên thiết bị màn hình cảm ứng để giữ hành vi vuốt gốc.
27. [ ] Camera LookAt luôn chuyển đổi mượt mà bằng phép nội suy Lerp giữa các mục tiêu.
28. [ ] Thanh tiến trình Scrubber hiển thị vị trí chính xác của người dùng trong hành trình.
29. [ ] Tiêu đề phân cảnh chuyển đổi ăn khớp với từng góc máy.
30. [ ] Không bị lỗi trắng màn hình khi người dùng cuộn ngược thật nhanh lên đầu trang.

### Nhóm D: Tương Tác Không Gian & Điểm Neo 3D Sang 2D (10 Tiêu Chí)
31. [ ] Tọa độ 3D-to-2D Projection tính toán chính xác bằng `.project(camera)`.
32. [ ] Các đường chỉ dẫn SVG (Leader Lines) co giãn mềm mại theo thời gian thực.
33. [ ] Ẩn các thẻ Hotspot khi điểm neo 3D xoay ra phía sau lưng camera (`vector.z > 1.0`).
34. [ ] Thẻ HTML Hotspot có thuộc tính `pointer-events: auto` trong khi container mẹ là `pointer-events: none`.
35. [ ] Con trỏ chuột Reticle di chuyển bám sát con trỏ gốc với độ trễ quán tính đẹp mắt.
36. [ ] Con trỏ chuột phóng to khi rê vào các nút bấm tương tác (Magnetic Snap).
37. [ ] Hover vào vật thể 3D làm phát sáng hoặc nâng nhẹ độ cao vật thể bằng Raycasting.
38. [ ] Bấm vào thẻ Hotspot kích hoạt góc nhìn cận cảnh (Dolly Zoom Focus).
39. [ ] Dây nối SVG có nét đứt hiện đại `stroke-dasharray="4 2"` phát sáng màu cyan.
40. [ ] Không bị lệch vị trí thẻ khi người dùng phóng to thu nhỏ cửa sổ trình duyệt.

### Nhóm E: Âm Thanh Không Gian & Trực Quan Hóa HUD (10 Tiêu Chí)
41. [ ] Nút bật/tắt âm thanh (Mute Toggle) hiển thị rõ ràng, tôn trọng người dùng.
42. [ ] Tiếng Sub-bass Drone 42Hz rung trầm nhẹ nhàng, tạo độ sâu không gian mà không gây khó chịu.
43. [ ] Tiếng click cơ học siêu nhẹ phát ra khi rê chuột vào các phần tử giao diện.
44. [ ] Tiếng sóng radar sonar ping ngân vang đồng bộ với đỉnh sóng của Shader Radar.
45. [ ] Tọa độ GPS Telemetry cập nhật liên tục các giá trị thực.
46. [ ] Bộ đếm số động (Animated Counter) nhảy số mượt mà khi cuộn trang.
47. [ ] Sử dụng font chữ Monospace chuẩn xác (`JetBrains Mono` hoặc `Space Grotesk`).
48. [ ] Các thẻ Bento Grid sử dụng kính mờ cao cấp với viền gradient 1px tinh xảo.
49. [ ] Hiển thị thông báo trạng thái mạng lưới (Live Node Ticker) thời gian thực.
50. [ ] Nút Kêu gọi Hành động (CTA: Connect Wallet) luôn nổi bật và sẵn sàng nhận click.

## 14. KIẾN TRÚC TÍCH HỢP REACT THREE FIBER (R3F) & NEXT.JS 14 APP ROUTER

Đối với các dự án lớn như **UniSynapse** xây dựng trên nền tảng **Next.js 14** (App Router), việc tích hợp WebGL dưới dạng Declarative Components bằng **React Three Fiber (@react-three/fiber)** và **Drei (@react-three/drei)** là giải pháp tiêu chuẩn công nghiệp. Dưới đây là kiến trúc tích hợp toàn diện:

### 14.1. Cấu Trúc File & Dynamic Import Tránh Lỗi SSR (Server-Side Rendering)

WebGL và Three.js cần truy cập trực tiếp vào đối tượng `window` và `HTMLCanvasElement`, do đó tuyệt đối không thể render trên server:

```tsx
// app/web3d/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import với ssr: false để chỉ chạy trên client
const WorldExperience3D = dynamic(
  () => import("@/components/web3d/WorldExperience3D"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#040508] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-cyan-300 tracking-widest uppercase animate-pulse">
            INITIALIZING WEBGL 2.0 ENVIRONMENT...
          </span>
        </div>
      </div>
    )
  }
);

export default function Web3DPage() {
  return (
    <main className="relative min-h-screen bg-[#040508] text-white">
      <WorldExperience3D />
    </main>
  );
}
```

### 14.2. Component Canvas 3D Chính Với R3F & Drei

```tsx
// components/web3d/WorldExperience3D.tsx
"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Environment,
  Html,
  ScrollControls,
  useScroll,
  Float,
  ContactShadows
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";

// Custom Component Khối Kiến Trúc Vát Cạnh R3F
function ChamferedMonolith({ position, scale, isKeyNode = false, title = "", reward = "" }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Tạo hình học Chamfered Bevel
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    const w = 1.0, d = 1.0, b = 0.15;
    const hw = w / 2, hd = d / 2;
    s.moveTo(hw - b, -hd);
    s.lineTo(hw, -hd + b);
    s.lineTo(hw, hd - b);
    s.lineTo(hw - b, hd);
    s.lineTo(-hw + b, hd);
    s.lineTo(-hw, hd - b);
    s.lineTo(-hw, -hd + b);
    s.lineTo(-hw + b, -hd);
    s.closePath();

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 1.0,
      bevelEnabled: true,
      bevelThickness: b * 0.8,
      bevelSize: b * 0.8,
      bevelSegments: 2
    });
    g.center();
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  // Hiệu ứng hover nhấc nhẹ khối nhà
  useFrame(() => {
    if (meshRef.current) {
      const targetY = hovered ? position[1] + 0.8 : position[1];
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        scale={scale}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color={hovered ? 0x1e293b : isKeyNode ? 0x162032 : 0x121620}
          metalness={0.88}
          roughness={0.22}
          clearcoat={0.65}
          clearcoatRoughness={0.12}
          reflectivity={0.85}
        />
      </mesh>

      {/* Hotspot 3D ghim trực tiếp bằng Drei HTML với Occlude */}
      {isKeyNode && (
        <Html
          position={[0, scale[1] + 1.2, 0]}
          center
          distanceFactor={24}
          occlude
          className="pointer-events-auto select-none"
        >
          <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 p-3 rounded-lg shadow-2xl min-w-[180px] font-mono transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-bold text-cyan-300">{title}</span>
            </div>
            <div className="text-[10px] text-slate-400">STATUS: VERIFIED</div>
            <div className="text-[11px] font-bold text-emerald-400 mt-1">{reward}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Component Điều Khiển Camera Theo Cuộn Trang (Scroll-driven Camera Rig)
function CameraRig() {
  const scroll = useScroll();
  const { camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(0, 2, 0), []);

  // Đường cong Spline 3D Catmull-Rom
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 15, 32),
      new THREE.Vector3(14, 6, 12),
      new THREE.Vector3(-12, 5, -8),
      new THREE.Vector3(8, 7, -20),
      new THREE.Vector3(0, 20, 18)
    ]);
  }, []);

  useFrame(() => {
    // scroll.offset có giá trị từ 0.0 đến 1.0 tương ứng toàn bộ quãng đường cuộn
    const pos = curve.getPoint(scroll.offset);
    camera.position.lerp(pos, 0.08);
    camera.lookAt(targetVec);
  });

  return null;
}

export default function WorldExperience3D() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <color attach="background" args={["#040508"]} />
        <fogExp2 attach="fog" args={["#040508", 0.02]} />

        {/* Lighting Rig */}
        <directionalLight
          position={[40, 50, 30]}
          intensity={3.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-40, 25, -40]} intensity={4.5} color="#70b0ff" />
        <hemisphereLight args={["#1a2638", "#040508", 0.35]} />

        {/* Scroll Controls bao quanh cảnh vật */}
        <ScrollControls pages={5} damping={0.25}>
          <CameraRig />

          {/* Cụm Kiến Trúc Thành Phố */}
          <ChamferedMonolith position={[0, 0, 0]} scale={[3, 14, 3]} isKeyNode title="THÁP THƯ VIỆN TRI THỨC" reward="+250 UP" />
          <ChamferedMonolith position={[8, 0, -4]} scale={[2.5, 9, 2.5]} isKeyNode title="TRỤ ĐỒNG THUẬN BFT 80%" reward="+150 UP" />
          <ChamferedMonolith position={[-8, 0, -6]} scale={[2.8, 10, 2.8]} isKeyNode title="ĐƯỜNG HẦM AN NINH" reward="+300 UP" />
          <ChamferedMonolith position={[4, 0, -14]} scale={[2.2, 7, 2.2]} isKeyNode title="SOLANA DEVNET VAULT" reward="INSTANT" />
          <ChamferedMonolith position={[-5, 0, -16]} scale={[2.4, 8, 2.4]} isKeyNode title="AI TUTOR NEXUS" reward="RAG SEARCH" />

          {/* Sàn Lưới & Bóng Đổ */}
          <ContactShadows position={[0, -0.01, 0]} opacity={0.7} scale={60} blur={2.5} far={10} color="#000000" />
        </ScrollControls>

        {/* Post-processing */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.82} mipmapBlur intensity={1.3} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
```


---

## 15. TÍCH HỢP SPLINE 3D RUNTIME & CẦU NỐI JAVASCRIPT

Trong Case Study của **Mariusz Mitkow (@mitkow_1)** với chiếc Tesla Cybertruck (Video 6), nhà thiết kế sử dụng **Spline 3D** để dựng chi tiết cơ học, tạo vật liệu phản quang kim loại và gán sẵn các trạng thái (States) chuyển động, sau đó nhúng vào trang web bằng `@splinetool/runtime`:

### 15.1. Quy Trình Thiết Kế Trong Spline 3D
1. **Dựng Khối**: Tạo mô hình với độ vát sắc cạnh, áp dụng vật liệu `Glass` hoặc `Metal` với `Roughness: 0.15`, `Metalness: 0.95`.
2. **Tạo Các State (Trạng Thái Chuyển Động)**:
   - `Base`: Góc nhìn 3/4 mặt trước xe.
   - `SideProfile`: Góc nhìn ngang hông 90 độ, hệ thống treo hạ thấp.
   - `TonneauOpen`: Góc nhìn từ trên cao, nắp thùng xe trượt mở.
3. **Gán Biến Số (Variables)**: Tạo biến số `scrollPercent` (kiểu Number từ 0 đến 100) để điều khiển vị trí xoay của vật thể.
4. **Xuất Mã Nhúng**: Lấy đường dẫn file `.splinecode` từ Spline Cloud.

### 15.2. Cầu Nối Điều Khiển Spline Bằng JavaScript & GSAP

```javascript
import { Application } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export async function initSplineExperience(canvasElement, splineUrl) {
  const spline = new Application(canvasElement);
  
  // Tải file Spline runtime
  await spline.load(splineUrl);
  console.log("Spline 3D Scene Loaded Successfully!");

  // Tìm các vật thể theo tên đã đặt trong Spline Editor
  const vehicleBody = spline.findObjectByName("Cybertruck_Body");
  const tonneauCover = spline.findObjectByName("Tonneau_Cover");
  const cameraSpline = spline.findObjectByName("Main_Camera");

  // Đồng bộ với GSAP ScrollTrigger
  ScrollTrigger.create({
    trigger: "#scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.0,
    onUpdate: (self) => {
      const p = self.progress; // 0.0 -> 1.0

      // Xoay thân xe theo tiến độ cuộn trang
      if (vehicleBody) {
        vehicleBody.rotation.y = p * Math.PI * 1.5;
      }

      // Mở nắp thùng xe ở giai đoạn từ 60% đến 90% cuộn trang
      if (tonneauCover) {
        if (p > 0.6) {
          const openFactor = Math.min(1.0, (p - 0.6) / 0.3);
          tonneauCover.position.z = -openFactor * 4.2;
        } else {
          tonneauCover.position.z = 0;
        }
      }

      // Bắn biến số vào Spline Event System
      spline.setVariable("scrollProgress", p * 100);
    }
  });
}
```

## 16. HỆ THỐNG 15 PIPELINE CHUYÊN BIỆT ĐỘC LẬP CHO UNISYNAPSE

Để UniSynapse không chỉ có 1 trang chủ đơn lẻ mà sở hữu một **hệ sinh thái sản xuất Web 3D toàn diện (Web 3D Production Ecosystem)**, 15 pipeline độc lập dưới đây được thiết kế để giải quyết từng bài toán tương tác cụ thể của nền tảng:

### Pipeline 01: Cinematic Widescreen Trailer (`01_cinematic_widescreen_trailer.html`)
- **Tỷ lệ khung hình**: Chuẩn điện ảnh Anamorphic 2.39:1 với hai dải đen Letterbox trên dưới.
- **Cơ chế 3D**: Camera Dolly tiến vào Lõi Não Bộ Tri Thức (Knowledge Core Icosahedron) với sương mù thể tích (Volumetric Fog) và vệt sáng Anamorphic Flare.
- **Tương tác**: Thanh trượt Director Scrubber cho phép tua nhanh/chậm thời gian của cảnh quay, kèm nút bấm chọn góc máy (Wide, Close-up, Dutch Angle).

### Pipeline 02: Backlot Living Storyboard (`02_backlot_living_storyboard.html`)
- **Thị giác**: Bảng điều khiển trường quay điện ảnh thời gian thực. Hàng đèn Studio chuyển động theo quỹ đạo tròn.
- **Cơ chế 3D**: Khung cảnh phim trường thu nhỏ (Backlot Studio) với các mô hình diễn tập phân cảnh được chiếu sáng bằng đèn rọi có bóng đổ thực.
- **Tương tác**: Thanh Filmstrip cuộn ngang ở đáy màn hình; nhấp vào từng phân đoạn phim (Scene 01 -> Scene 05) làm camera trượt ray (Slider Dolly) mượt mà đến đúng vị trí.

### Pipeline 03: Hyperframes Kinetic Swiss (`03_hyperframes_kinetic_swiss.html`)
- **Thị giác**: Đồ họa Thụy Sĩ (Swiss-Grid Design) với chữ Typography khổng lồ 160px (`Syne` / `Clash Display`).
- **Cơ chế 3D**: Các khối đa giác 3D xoay chậm theo quán tính chuột, che khuất một phần chữ typography để tạo ảo giác chiều sâu Z-Depth tuyệt đối.
- **Tương tác**: Tốc độ cuộn chuột làm biến dạng (Kinetic Distortion) các đường lưới kẻ ô (Grid Matrix).

### Pipeline 04: Interactive 3D World Flythrough (`04_interactive_3d_world_flythrough.html`)
- **Thị giác**: Bản đồ địa hình đô thị số hóa rộng lớn với 5 trạm mốc học thuật của UniSynapse.
- **Cơ chế 3D**: Camera Drone điều khiển bằng đường cong Spline Catmull-Rom bay lướt qua các tòa tháp kim loại vát góc.
- **Tương tác**: Tâm ngắm hàng không (Drone Reticle) bám sát chuột; bảng HUD hiển thị tọa độ GPS, độ cao bay (ALT: 124M) và tốc độ gió.

### Pipeline 05: Director Studio Lighting Rig (`05_director_studio_lighting_rig.html`)
- **Thị giác**: Phòng hiệu chỉnh ánh sáng chuyên nghiệp (Virtual Lighting Lab).
- **Cơ chế 3D**: Vật thể trung tâm là chiếc cúp biểu trưng UniSynapse mạ vàng và titan. Ba nguồn đèn Key, Fill, Rim Light có biểu tượng bóng đèn 3D phát sáng.
- **Tương tác**: Bảng điều khiển cho phép người dùng kéo thanh trượt chỉnh nhiệt độ màu Kelvin (2700K Warm -> 6500K Cool White), chỉnh góc chiếu và độ gắt của bóng đổ mềm.

### Pipeline 06: Animated Data Explainer (`06_animated_data_explainer.html`)
- **Thị giác**: Không gian phân tích dữ liệu trực quan 3D với biểu đồ cột và đồ thị hình học lơ lửng.
- **Cơ chế 3D**: Chứng minh toán học cho thuật toán đồng thuận Byzantine Fault Tolerance (BFT 80%). Các cột trụ dữ liệu tự động vươn cao khi tỷ lệ đồng thuận đạt ngưỡng an toàn.
- **Tương tác**: Người dùng có thể kéo thanh trượt giả lập tấn công mạng (Simulate Malicious Nodes) để xem hệ thống BFT tự động cách ly các node xấu như thế nào.

### Pipeline 07: Synthetic Screen Demo Terminal (`07_synthetic_screen_demo_terminal.html`)
- **Thị giác**: Màn hình cong 3D Holographic lơ lửng trong không gian tối.
- **Cơ chế 3D**: Sử dụng kỹ thuật render Canvas sang Texture (`CanvasTexture`) để hiển thị trực tiếp một giao diện dòng lệnh Linux/Python đang chạy.
- **Tương tác**: Người dùng có thể gõ phím trực tiếp trên bàn phím thật, các ký tự xuất hiện tức thì trên màn hình 3D với hiệu ứng quét CRT Scanline và nhấp nháy xanh phosphor.

### Pipeline 08: Vector Cloud Hyperwarp (`08_vector_cloud_hyperwarp.html`)
- **Thị giác**: Đám mây 2,000+ điểm vector embedding đại diện cho kho tàng 150 triệu trang giáo trình số hóa.
- **Cơ chế 3D**: Hệ thống hạt GPU InstancedBufferGeometry chuyển động uốn lượn theo trường vector Curl Noise.
- **Tương tác**: Khi bấm nút "Truy Vấn Ngữ Nghĩa (Semantic Search)", camera thực hiện cú nhảy siêu tốc (Hyperwarp Jump) lao xuyên qua các hạt bụi sao để dừng lại trước trang tài liệu phù hợp nhất.

### Pipeline 09: Document Six Gates Tunnel (`09_document_six_gates_tunnel.html`)
- **Thị giác**: Đường hầm lục giác kiểm định an ninh tài liệu 6 lớp.
- **Cơ chế 3D**: 6 cổng lục giác khổng lồ xoay đồng trục. Một tài liệu 3D bay xuyên qua từng cổng: Cổng 1 quét PII (Laser đỏ), Cổng 2 tạo Hash SHA-256 (Ánh tím), Cổng 3 kiểm tra bản quyền, v.v.
- **Tương tác**: Người dùng có thể thả (Drag & Drop) một file PDF vào đường hầm để kích hoạt hoạt ảnh quét an ninh theo thời gian thực.

### Pipeline 10: Solana Ledger Wormhole (`10_solana_ledger_wormhole.html`)
- **Thị giác**: Lỗ sâu lượng tử thanh khoản blockchain.
- **Cơ chế 3D**: Máy gia tốc hạt hình xuyến (Torus Particle Accelerator) xoay tròn với ánh sáng màu tím và ngọc lam đặc trưng của Solana.
- **Tương tác**: Bộ đếm thời gian giải ngân đếm ngược từ `3.2s` xuống `0.0s`, sau đó một luồng hạt ánh sáng bùng nổ (Particle Burst) xác nhận giao dịch ghi nhận thành công trên Devnet.

### Pipeline 11: Sound Design Foley Matrix (`11_sound_design_foley_matrix.html`)
- **Thị giác**: Ma trận âm thanh vòm kỹ thuật số.
- **Cơ chế 3D**: Một máy hiện sóng 3D hình cầu (3D Spherical Oscilloscope) biến dạng hình học theo phổ tần số thời gian thực phân tích bằng `AnalyserNode` của Web Audio API.
- **Tương tác**: Người dùng có thể click vào các phím Pad âm thanh để kích hoạt các tần số sóng khác nhau, quan sát quả cầu 3D nảy nở theo từng nhịp bass.

### Pipeline 12: Character Avatar Spokesperson (`12_character_avatar_spokesperson.html`)
- **Thị giác**: Hình chiếu Hologram của AI Scholar - Người bảo trợ học thuật UniSynapse.
- **Cơ chế 3D**: Mô hình nhân vật 3D bán trong suốt với hiệu ứng quét ánh sáng ngang (Scanlines) và đường viền phát sáng Fresnel.
- **Tương tác**: Đầu và ánh mắt của nhân vật tự động xoay dõi theo con trỏ chuột (`lookAt(mouse)`); miệng nhấp nháy phát sáng đồng bộ với giọng nói tổng hợp.

### Pipeline 13: Cinematic Documentary Archive (`13_cinematic_documentary_archive.html`)
- **Thị giác**: Kho tư liệu lịch sử điện ảnh với chiều sâu trường ảnh mờ nhạt (Cinematic Bokeh DoF).
- **Cơ chế 3D**: Các tấm ảnh tư liệu học thuật lơ lửng trong không gian 3 chiều theo hình xoắn ốc Fibonacci.
- **Tương tác**: Cuộn trang làm xoay trục xoắn ốc; tấm ảnh được chọn sẽ bay ra chính diện với hiệu ứng phóng to sắc nét, trong khi các tấm ảnh khác chìm vào lớp mờ Bokeh.

### Pipeline 14: DePIN Staking Vault Hypercube (`14_depin_staking_vault_hypercube.html`)
- **Thị giác**: Kho két Staking 4 chiều (Tesseract 4D Hypercube).
- **Cơ chế 3D**: Khối lập phương lồng bên trong một khối lập phương khác, xoay chuyển không gian liên tục thông qua phép biến đổi ma trận 4 chiều chiếu về 3D.
- **Tương tác**: Người dùng kéo thanh trượt nạp số lượng UP Token, hồ hạt từ tính xung quanh khối Hypercube sẽ dày đặc hơn và xoay với vận tốc ánh sáng.

### Pipeline 15: Master Production Suite Hub (`15_master_production_suite_hub.html`)
- **Thị giác**: Bàn điều khiển trung tâm đa kênh tối thượng kết nối toàn bộ 14 pipeline trên.
- **Cơ chế 3D**: Khung cảnh trung tâm hiển thị quả địa cầu kết nối mạng lưới các trường đại học toàn cầu.
- **Tương tác**: Hệ thống chuyển kênh mượt mà (Seamless Viewport Transition), cho phép người dùng click vào bất kỳ trạm nào để chuyển ngay sang pipeline tương ứng mà không cần reload lại trang web.

## 17. QUY TRÌNH TỰ ĐỘNG HÓA BLENDER PYTHON & XUẤT ASSET CHUẨN DRACO

Đối với các mô hình 3D phức tạp (như mô hình xe hơi Cybertruck hay máy chủ phân tán), việc tối ưu hóa thủ công từng file tốn rất nhiều thời gian. Kỹ sư đồ họa WebGL chuyên nghiệp luôn sử dụng **Script Python chạy ngầm trong Blender (Headless Blender)** để tự động hóa toàn bộ quy trình:

### 17.1. Script Python Tự Động Vát Cạnh, Nướng Texture & Xuất GLTF Nén Draco

Lưu script này thành `optimize_web3d_assets.py` và chạy bằng lệnh:
`blender -b my_scene.blend -P optimize_web3d_assets.py -- output_model.glb`

```python
import bpy
import sys
import os

def optimize_and_export_draco(output_path):
    print(">>> BẮT ĐẦU QUY TRÌNH TỐI ƯU HÓA ASSET CHO WEB 3D...")
    
    # 1. Chọn toàn bộ vật thể Mesh
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            
            # 2. Tự động thêm Bevel Modifier nếu chưa có vát cạnh
            has_bevel = any(m.type == "BEVEL" for m in obj.modifiers)
            if not has_bevel:
                print(f"Adding Chamfer Bevel to: {obj.name}")
                bev = obj.modifiers.new(name="AutoChamfer", type="BEVEL")
                bev.width = 0.05
                bev.segments = 2
                bev.limit_method = "ANGLE"
                bev.angle_limit = 0.523599 # 30 độ
            
            # 3. Áp dụng toàn bộ Modifier thành Mesh thực tế
            bpy.ops.object.convert(target="MESH")
            
            # 4. Trải UV Smart Project cho vật thể
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.select_all(action="SELECT")
            bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.005)
            bpy.ops.object.mode_set(mode="OBJECT")

    # 5. Xuất file GLTF/GLB với chuẩn nén DRACO nén dung lượng tới 85%
    print(f">>> ĐANG XUẤT FILE NÉN DRACO TẠI: {output_path}")
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        use_selection=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7, # Mức nén cân bằng tốc độ giải nén
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_apply=True,
        export_materials="EXPORT",
        export_colors=True
    )
    print(">>> HOÀN THÀNH XUẤT ASSET CHUẨN THẾ GIỚI!")

if __name__ == "__main__":
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    out_file = argv[0] if len(argv) > 0 else "optimized_asset.glb"
    optimize_and_export_draco(out_file)
```


---

## 18. CẨM NANG GỠ LỖI & SỬA LỖI WEBGL KINH ĐIỂN (TROUBLESHOOTING ENCYCLOPEDIA)

Trong quá trình phát triển các website 3D Awwwards, các lập trình viên thường xuyên gặp phải 6 nhóm lỗi "ác mộng" sau. Dưới đây là phác đồ điều trị chính xác từng dòng code:

### 18.1. Lỗi Nhấp Nháy Mặt Phẳng Trùng Nhau (Z-Fighting / Stitching Artifacts)
- **Hiện tượng**: Khi hai mặt phẳng nằm quá gần nhau (ví dụ: Mặt đường và rãnh vi mạch), máy tính không phân biệt được mặt nào ở trước, khiến bề mặt bị sọc đen trắng nhấp nháy liên tục khi camera di chuyển.
- **Nguyên nhân toán học**: Độ chính xác của bộ đệm chiều sâu (Depth Buffer - thường là 24-bit) bị cạn kiệt, đặc biệt khi tỷ lệ `camera.far / camera.near` quá lớn.
- **Giải pháp triệt để**:
  1. Thu hẹp tỷ lệ camera: Đặt `camera.near = 0.5` hoặc `1.0` (tuyệt đối không đặt `camera.near = 0.001` nếu không cần thiết); đặt `camera.far = 300` thay vì `10000`.
  2. Dùng thuộc tính `polygonOffset` trong vật liệu Three.js để ép GPU vẽ mặt phẳng này đè lên mặt phẳng kia:
  ```javascript
  const roadMarkingMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    polygonOffset: true,
    polygonOffsetFactor: -1.0, // Đẩy ưu tiên vẽ đè lên trên
    polygonOffsetUnits: -4.0
  });
  ```

### 18.2. Lỗi Sọc Vằn Bóng Đổ (Shadow Acne) & Đứt Gốc Bóng Đổ (Peter Panning)
- **Hiện tượng**: Bề mặt tòa nhà xuất hiện các sọc vằn đen như da ngựa vằn, hoặc bóng đổ bị bay lơ lửng tách rời khỏi chân tòa tháp.
- **Nguyên nhân**: Sai số lượng tử hóa trong ma trận bản đồ bóng đổ (Shadow Map Resolution).
- **Giải pháp triệt để**: Tinh chỉnh đồng thời cặp tham số `bias` và `normalBias`:
  ```javascript
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.02; // Bù sai số theo hướng pháp tuyến
  ```

### 18.3. Lỗi Mất Ngữ Cảnh WebGL (WebGL Context Lost Crash)
- **Hiện tượng**: Màn hình 3D bỗng nhiên biến thành màu đen kịt, bảng console báo lỗi `WARNING: WebGL: context lost`. Thường xảy ra khi người dùng mở nhiều tab hoặc card đồ họa bị nghẽn.
- **Giải pháp triệt để**: Lắng nghe sự kiện và phục hồi tự động:
  ```javascript
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    console.warn("WebGL Context Lost! Đang tạm dừng render loop...");
    cancelAnimationFrame(animationFrameId);
  }, false);

  canvas.addEventListener("webglcontextrestored", () => {
    console.info("WebGL Context Restored! Đang tái khởi tạo tài nguyên...");
    initSceneAndShaders();
    animate();
  }, false);
  ```

### 18.4. Lỗi Sai Lệch Hệ Màu & Ánh Sáng Tối Tăm (Color Space & Gamma Mismatch)
- **Hiện tượng**: Mô hình 3D trong Three.js trông xám xịt, màu sắc nhạt nhòa không rực rỡ như khi xem trong Blender.
- **Nguyên nhân**: Three.js r152+ chuyển đổi mặc định sang hệ màu tuyến tính (Linear Color Space), trong khi các texture ảnh và màn hình sử dụng sRGB.
- **Giải pháp triệt để**:
  ```javascript
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  texture.colorSpace = THREE.SRGBColorSpace; // Áp dụng cho map màu Diffuse
  // Riêng RoughnessMap và NormalMap giữ nguyên NoColorSpace / Linear:
  normalTexture.colorSpace = THREE.NoColorSpace;
  ```

## 19. MÃ NGUỒN THỰC THI CHI TIẾT CỦA 15 PIPELINE CHUYÊN BIỆT

Dưới đây là phần triển khai kỹ thuật cụ thể của 15 Pipeline chuyên biệt đã nêu trong Chương 16. Mỗi pipeline đi kèm toàn bộ cấu trúc mã nguồn Three.js, shader và cơ chế tương tác:

### 19.1. Pipeline 01: Mã Nguồn Trailer Điện Ảnh Widescreen (`01_cinematic_widescreen_trailer.js`)
```javascript
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export class CinematicTrailerPipeline {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040508, 0.025);
    this.camera = new THREE.PerspectiveCamera(40, 2.39, 0.1, 150); // Tỷ lệ 2.39:1 Anamorphic
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    
    this.initLights();
    this.initCoreMonolith();
    this.initComposer();
    this.setupDirectorTimeline();
  }

  initLights() {
    const key = new THREE.DirectionalLight(0xe8f2ff, 3.5);
    key.position.set(25, 30, 20);
    key.castShadow = true;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x70b0ff, 5.0);
    rim.position.set(-25, 15, -20);
    this.scene.add(rim);
  }

  initCoreMonolith() {
    // Lõi Não Bộ Tri Thức Icosahedron
    const geo = new THREE.IcosahedronGeometry(3.5, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x121620,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: false
    });
    this.core = new THREE.Mesh(geo, mat);
    this.scene.add(this.core);

    // Vòng khung lồng bên ngoài
    const wireGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.4 });
    this.wire = new THREE.Mesh(wireGeo, wireMat);
    this.scene.add(this.wire);
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.4, 0.4, 0.8);
    this.composer.addPass(bloom);
  }

  setupDirectorTimeline() {
    this.cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 8, 28),
      new THREE.Vector3(10, 4, 15),
      new THREE.Vector3(0, 2, 7)
    ]);
  }

  seek(progress) {
    const p = Math.max(0, Math.min(1, progress));
    const pos = this.cameraCurve.getPoint(p);
    this.camera.position.copy(pos);
    this.camera.lookAt(0, 0, 0);
    this.core.rotation.y = p * Math.PI * 2;
    this.wire.rotation.x = -p * Math.PI * 1.5;
    this.composer.render();
  }
}
```

### 19.2. Pipeline 02: Bảng Điều Khiển Trường Quay Diễn Tập Phim Trường (`02_backlot_living_storyboard.js`)
```javascript
export class BacklotStoryboardPipeline {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.spotlights = [];
    this.initStageGrid();
    this.initMovingSpotlights();
  }

  initStageGrid() {
    const grid = new THREE.GridHelper(60, 30, 0x00f2fe, 0x1e293b);
    grid.position.y = -0.01;
    this.scene.add(grid);
  }

  initMovingSpotlights() {
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.SpotLight(0xffffff, 4.0, 40, Math.PI / 6, 0.3, 1);
      spot.position.set(Math.cos(i * Math.PI / 2) * 15, 18, Math.sin(i * Math.PI / 2) * 15);
      spot.castShadow = true;
      this.scene.add(spot);
      this.spotlights.push(spot);
    }
  }

  update(time) {
    this.spotlights.forEach((spot, idx) => {
      const angle = time * 0.4 + (idx * Math.PI / 2);
      spot.position.x = Math.cos(angle) * 16;
      spot.position.z = Math.sin(angle) * 16;
    });
  }
}
```

### 19.3. Pipeline 03: Typography Động Năng Thụy Sĩ & Z-Depth (`03_hyperframes_kinetic_swiss.js`)
```javascript
export function initKineticTypographyZDepth(containerId) {
  const textBg = document.getElementById("swiss-text-bg");
  const textFg = document.getElementById("swiss-text-fg");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    // Lớp chữ nền lướt chậm với hiệu ứng mờ Z-Depth
    if (textBg) {
      textBg.style.transform = `translate3d(${-scrollY * 0.25}px, 0, 0)`;
      textBg.style.filter = `blur(${Math.min(12, scrollY * 0.02)}px)`;
    }
    // Lớp chữ tiền cảnh lướt nhanh sắc nét
    if (textFg) {
      textFg.style.transform = `translate3d(${scrollY * 0.5}px, 0, 0)`;
    }
  });
}
```

### 19.4. Pipeline 04: Bản Đồ Chuyến Bay Khám Phá Drone 3D (`04_interactive_3d_world_flythrough.js`)
```javascript
export class DroneFlightController {
  constructor(camera, waypoints) {
    this.camera = camera;
    this.waypoints = waypoints;
    this.curve = new THREE.CatmullRomCurve3(waypoints.map(w => w.position));
    this.target = new THREE.Vector3();
    this.currentT = 0;
  }

  flyTo(progress, duration = 2.0) {
    gsap.to(this, {
      currentT: progress,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = this.curve.getPoint(this.currentT);
        this.camera.position.copy(p);
        
        // Nhìn hướng về phía trước tiếp tuyến của đường cong
        const tangent = this.curve.getTangent(this.currentT);
        this.target.copy(p).add(tangent);
        this.camera.lookAt(this.target);
      }
    });
  }
}
```

### 19.5. Pipeline 05: Phòng Chỉnh Ánh Sáng Trường Quay Kelvin (`05_director_studio_lighting_rig.js`)
```javascript
export function kelvinToRGB(kelvin) {
  const temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temp) - 161.1195681661;
    blue = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    blue = 255;
  }

  return new THREE.Color(
    Math.min(1, Math.max(0, red / 255)),
    Math.min(1, Math.max(0, green / 255)),
    Math.min(1, Math.max(0, blue / 255))
  );
}
```

### 19.6. Pipeline 06: Biểu Đồ Động Học Minh Họa Toán Học BFT 80% (`06_animated_data_explainer.js`)
```javascript
export function createBFTVisualizer(scene) {
  const nodeCount = 30;
  const nodes = [];
  const group = new THREE.Group();

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const geom = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00f5a0, metalness: 0.8, roughness: 0.2 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(Math.cos(angle) * 8, 1.25, Math.sin(angle) * 8);
    group.add(mesh);
    nodes.push(mesh);
  }

  scene.add(group);
  return { group, nodes };
}
```

### 19.7. Pipeline 07: Màn Hình Cong 3D Terminal Console (`07_synthetic_screen_demo_terminal.js`)
```javascript
export function createCurvedTerminalScreen(scene) {
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 1024;
  canvas2d.height = 512;
  const ctx = canvas2d.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas2d);
  const geometry = new THREE.CylinderGeometry(8, 8, 4, 32, 1, true, -Math.PI / 4, Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
  const screenMesh = new THREE.Mesh(geometry, material);
  scene.add(screenMesh);

  let lines = ["[SYSTEM BOOT] UniSynapse Node v2.4 initialized...", "[API] FastAPI endpoint /v1/ledger listening...", "[BFT] 30/30 validator nodes confirmed block #8921."];

  function renderText() {
    ctx.fillStyle = "#040508";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = "#00f2fe";
    ctx.font = "bold 22px JetBrains Mono";
    lines.forEach((line, idx) => {
      ctx.fillText(line, 40, 60 + idx * 36);
    });
    texture.needsUpdate = true;
  }
  renderText();

  return { screenMesh, renderText, addLine: (txt) => { lines.push(txt); if (lines.length > 12) lines.shift(); renderText(); } };
}
```

### 19.8. Pipeline 08: Đám Mây Vector 2,000 Hạt & Hyperwarp (`08_vector_cloud_hyperwarp.js`)
```javascript
export function createVectorCloudHyperwarp(scene, count = 2500) {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    colors[i * 3] = 0.0;
    colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
    colors[i * 3 + 2] = 1.0;
  }

  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(geom, mat);
  scene.add(points);
  return points;
}
```

### 19.9. Pipeline 09: Đường Hầm Kiểm Định An Ninh 6 Cổng (`09_document_six_gates_tunnel.js`)
```javascript
export function createSixGatesTunnel(scene) {
  const group = new THREE.Group();
  const rings = [];

  for (let i = 0; i < 6; i++) {
    const ringGeom = new THREE.TorusGeometry(3.5, 0.12, 6, 6); // Lục giác Torus
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.9, roughness: 0.15 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.z = -i * 5.0;
    group.add(ring);
    rings.push(ring);
  }

  scene.add(group);
  return { group, rings };
}
```

### 19.10. Pipeline 10: Lỗ Sâu Lượng Tử Solana Devnet (`10_solana_ledger_wormhole.js`)
```javascript
export function createSolanaWormhole(scene) {
  const torusGeom = new THREE.TorusGeometry(4.5, 0.8, 16, 100);
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0x9945ff, // Màu tím Solana
    emissive: 0x3d007a,
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 0.8
  });
  const wormhole = new THREE.Mesh(torusGeom, torusMat);
  scene.add(wormhole);
  return wormhole;
}
```

### 19.11. Pipeline 11: Máy Hiện Sóng Âm Thanh 3D (`11_sound_design_foley_matrix.js`)
```javascript
export class SoundVisualizerSphere {
  constructor(scene) {
    this.geom = new THREE.IcosahedronGeometry(2.5, 4);
    this.origPos = this.geom.attributes.position.clone();
    this.mat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, wireframe: true });
    this.mesh = new THREE.Mesh(this.geom, this.mat);
    scene.add(this.mesh);
  }

  updateWithFrequencyData(dataArray) {
    const pos = this.geom.attributes.position;
    const orig = this.origPos;
    for (let i = 0; i < pos.count; i++) {
      const audioVal = dataArray[i % dataArray.length] / 255.0;
      const factor = 1.0 + audioVal * 0.4;
      pos.setXYZ(i, orig.getX(i) * factor, orig.getY(i) * factor, orig.getZ(i) * factor);
    }
    pos.needsUpdate = true;
  }
}
```

### 19.12. Pipeline 12: Hình Chiếu AI Scholar Hologram (`12_character_avatar_spokesperson.js`)
```javascript
export function createHologramMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00f2fe) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        // Hiệu ứng viền phát sáng Fresnel
        float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
        // Hiệu ứng vạch quét Hologram
        float scanline = sin(gl_FragCoord.y * 0.8 + uTime * 6.0) * 0.15 + 0.85;
        gl_FragColor = vec4(uColor, fresnel * scanline * 0.9);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
}
```

### 19.13. Pipeline 13: Kho Tư Liệu Xoắn Ốc Fibonacci DoF (`13_cinematic_documentary_archive.js`)
```javascript
export function createFibonacciArchiveCards(scene, count = 24) {
  const cards = [];
  const cardGeom = new THREE.PlaneGeometry(2.4, 3.2);
  const cardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide });

  for (let i = 0; i < count; i++) {
    const phi = i * 137.5 * (Math.PI / 180); // Góc vàng Fibonacci
    const r = Math.sqrt(i) * 2.5;
    const mesh = new THREE.Mesh(cardGeom, cardMat);
    mesh.position.set(Math.cos(phi) * r, i * 0.35, Math.sin(phi) * r);
    mesh.lookAt(0, mesh.position.y, 0);
    scene.add(mesh);
    cards.push(mesh);
  }
  return cards;
}
```

### 19.14. Pipeline 14: Két Staking Hypercube 4D Tesseract (`14_depin_staking_vault_hypercube.js`)
```javascript
export class Tesseract4DProjection {
  constructor(scene) {
    this.outerBox = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true })
    );
    this.innerBox = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial({ color: 0x9945ff, wireframe: true })
    );
    this.group = new THREE.Group();
    this.group.add(this.outerBox, this.innerBox);
    scene.add(this.group);
  }

  update(t) {
    this.outerBox.rotation.x = t * 0.5;
    this.outerBox.rotation.y = t * 0.3;
    this.innerBox.rotation.x = -t * 0.8;
    this.innerBox.rotation.z = t * 0.4;
    const scale = 1.0 + Math.sin(t * 2.0) * 0.2;
    this.innerBox.scale.set(scale, scale, scale);
  }
}
```

### 19.15. Pipeline 15: Bàn Điều Khiển Master Suite Hub (`15_master_production_suite_hub.js`)
```javascript
export class MasterSuiteHub {
  constructor(pipelines) {
    this.pipelines = pipelines;
    this.activePipeline = null;
  }

  switchTo(pipelineId) {
    if (this.activePipeline && this.activePipeline.onExit) {
      this.activePipeline.onExit();
    }
    this.activePipeline = this.pipelines[pipelineId];
    if (this.activePipeline && this.activePipeline.onEnter) {
      this.activePipeline.onEnter();
    }
    console.log(`[MASTER HUB] Switched to pipeline: ${pipelineId}`);
  }
}
```

## 20. THƯ VIỆN CUSTOM GLSL SHADER ĐỈNH CAO CHO GIAO DIỆN WEB3 & SCI-FI

Dưới đây là 5 custom shader cao cấp giúp nâng tầm đồ họa của bất kỳ dự án Web 3D nào lên chuẩn Awwwards/FWA:

### 20.1. Shader Nhiễu Sóng Hologram & Tách Màu (Holographic Glitch & Chromatic Aberration)
```glsl
// Fragment Shader: Hiệu ứng nhiễu sóng Hologram và tách dải màu RGB
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uGlitchIntensity;
varying vec2 vUv;

float randomNoise(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    
    // Vệt rách ngẫu nhiên theo phương ngang (Horizontal Tear)
    float tear = step(0.96, randomNoise(vec2(floor(uv.y * 30.0), uTime)));
    uv.x += (randomNoise(vec2(uTime, uv.y)) - 0.5) * 0.04 * tear * uGlitchIntensity;

    // Tách kênh màu RGB (Chromatic Aberration)
    float shift = 0.008 * uGlitchIntensity;
    float r = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;

    // Vạch quét Scanlines
    float scanline = sin(uv.y * 800.0 + uTime * 10.0) * 0.05;

    gl_FragColor = vec4(vec3(r, g, b) - scanline, 1.0);
}
```

### 20.2. Shader Khiên Lực Trường Lục Giác (Hexagonal Forcefield Shield Shader)
```glsl
// Fragment Shader: Lưới lục giác Voronoi phát quang khi bị va chạm
uniform float uTime;
uniform vec3 uShieldColor;
uniform vec3 uImpactPoint;
varying vec3 vWorldPosition;
varying vec3 vNormal;

// Hàm tính khoảng cách lưới lục giác
vec2 hexCoords(vec2 uv) {
    vec2 r = vec2(1.0, 1.7320508);
    vec2 h = r * 0.5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    return dot(a, a) < dot(b, b) ? a : b;
}

void main() {
    vec2 hex = hexCoords(vWorldPosition.xy * 2.0);
    float edge = 1.0 - smoothstep(0.0, 0.06, abs(max(abs(hex.x) * 1.5 + hex.y, hex.y * 2.0) - 0.45));

    // Sóng xung kích lan tỏa từ điểm va chạm
    float distToImpact = distance(vWorldPosition, uImpactPoint);
    float shockwave = sin(distToImpact * 3.0 - uTime * 6.0) * 0.5 + 0.5;
    shockwave *= smoothstep(6.0, 0.0, distToImpact);

    // Viền Fresnel
    float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);

    float alpha = (edge * 0.4 + shockwave * 0.6 + fresnel * 0.3);
    gl_FragColor = vec4(uShieldColor, alpha);
}
```

### 20.3. Shader Kim Loại Lỏng Từ Tính (Magnetic Liquid Metal Displacement)
```glsl
// Vertex Shader: Biến dạng bề mặt chất lỏng kim loại bằng Simplex 3D
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Giả lập sóng gợn
void main() {
    vec3 pos = position;
    float wave = sin(pos.x * 2.0 + uTime * 2.0) * cos(pos.z * 2.0 + uTime * 2.0);
    pos += normal * wave * 0.25;
    
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
```

### 20.4. Shader Luồng Mưa Ký Tự Kỹ Thuật Số (Digital Matrix Rain Stream)
```glsl
// Fragment Shader: Cột ký tự xanh phosphor rơi thẳng đứng
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float col = floor(uv.x * 40.0);
    float speed = sin(col * 314.15) * 0.5 + 1.2;
    float row = fract(uv.y + uTime * speed);
    
    // Đầu vệt sáng màu trắng, đuôi màu xanh lục bảo
    float head = smoothstep(0.95, 1.0, row);
    float tail = (1.0 - row) * 0.8;
    
    vec3 green = vec3(0.0, 0.96, 0.62);
    vec3 color = mix(green * tail, vec3(1.0), head);
    
    gl_FragColor = vec4(color, max(head, tail));
}
```

### 20.5. Shader Tia Sáng Hoàng Hôn Xuyên Mây (Volumetric Crepuscular God Rays)
```glsl
// Fragment Shader: Hậu kỳ phóng tia sáng xuyên tâm từ vị trí nguồn sáng
uniform sampler2D tDiffuse;
uniform vec2 uLightScreenPos;
uniform float uDensity;
uniform float uWeight;
uniform float uDecay;
varying vec2 vUv;

const int NUM_SAMPLES = 64;

void main() {
    vec2 deltaTextCoord = (vUv - uLightScreenPos) * (1.0 / float(NUM_SAMPLES)) * uDensity;
    vec2 coord = vUv;
    vec4 color = texture2D(tDiffuse, coord);
    float illuminationDecay = 1.0;

    for(int i = 0; i < NUM_SAMPLES; i++) {
        coord -= deltaTextCoord;
        vec4 sampleColor = texture2D(tDiffuse, coord);
        sampleColor *= illuminationDecay * uWeight;
        color += sampleColor;
        illuminationDecay *= uDecay;
    }

    gl_FragColor = color;
}
```

## 21. NỀN TẢNG TOÁN HỌC & VẬT LÝ ĐỒ HỌA MÁY TÍNH DÀNH CHO WEB 3D

Hiểu rõ bản chất toán học giúp kỹ sư tự tay giải quyết mọi bài toán chuyển động phức tạp mà không bị phụ thuộc vào các thư viện bên ngoài:

### 21.1. Ma Trận & Tọa Độ Chuẩn Hóa Thiết Bị (Normalized Device Coordinates - NDC)

Mọi đỉnh trong không gian 3D trải qua chuỗi biến đổi ma trận để hiển thị lên màn hình máy tính:

```
Tọa độ cục bộ (Local Model Space)
        │
        ▼  x ModelMatrix
Tọa độ thế giới (World Space)
        │
        ▼  x ViewMatrix (Camera Matrix Inverse)
Tọa độ góc nhìn (View / Eye Space)
        │
        ▼  x ProjectionMatrix
Tọa độ cắt gọt (Clip Space: x, y, z, w)
        │
        ▼  / w (Perspective Divide)
Tọa độ chuẩn hóa (NDC: [-1.0, +1.0])
        │
        ▼  Viewport Transform
Tọa độ Pixel Màn Hình (Screen Pixels: [0, windowWidth] x [0, windowHeight])
```

#### Công Thức Chuyển Đổi Từ NDC Sang Pixel:
```javascript
export function ndcToPixel(ndcX, ndcY, screenWidth, screenHeight) {
  const pixelX = (ndcX * 0.5 + 0.5) * screenWidth;
  const pixelY = (-ndcY * 0.5 + 0.5) * screenHeight;
  return { x: pixelX, y: pixelY };
}
```

### 21.2. Phép Nội Suy Cầu Quaternions (Slerp - Spherical Linear Interpolation)

Góc Euler (X, Y, Z) thường xuyên bị lỗi "Khóa góc quay" (Gimbal Lock) khi quay camera qua góc 90 độ. Quaternions là giải pháp tối ưu:

```javascript
export function slerpCameraRotation(currentQuat, targetQuat, alpha) {
  // Công thức Slerp tính góc quay tự nhiên ngắn nhất trên mặt cầu
  return currentQuat.clone().slerp(targetQuat, alpha);
}
```

### 21.3. Mô Hình Vật Lý Lò Xo Giảm Chấn (Spring-Damper Physics) Cho Camera & Con Trỏ

Thay vì dùng hàm Lerp đơn giản, hệ thống lò xo giảm chấn (**Damped Spring Simulation**) tạo ra chuyển động tự nhiên như một vật thể có khối lượng thực:

```javascript
export class SpringDamper {
  constructor(stiffness = 120, damping = 14, mass = 1.0) {
    this.stiffness = stiffness; // Độ cứng của lò xo
    this.damping = damping;     // Hệ số cản ma sát
    this.mass = mass;           // Khối lượng
    this.position = 0;
    this.velocity = 0;
    this.target = 0;
  }

  update(dt) {
    const forceSpring = -this.stiffness * (this.position - this.target);
    const forceDamping = -this.damping * this.velocity;
    const acceleration = (forceSpring + forceDamping) / this.mass;
    
    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;
    return this.position;
  }
}
```

### 21.4. Công Cụ Đo Lường & Báo Cáo Hiệu Năng FPS Độc Lập (Standalone FPS Telemetry)
```javascript
export class FPSTelemetryTracker {
  constructor(domElementId) {
    this.el = document.getElementById(domElementId);
    this.frames = 0;
    this.prevTime = performance.now();
    this.fps = 60;
  }

  tick() {
    this.frames++;
    const time = performance.now();
    if (time >= this.prevTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
      if (this.el) {
        this.el.textContent = `FPS: ${this.fps} • MEM: ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 48}MB`;
      }
      this.frames = 0;
      this.prevTime = time;
    }
    return this.fps;
  }
}
```

## 22. KỊCH BẢN THỰC THI 4 PHÂN HỆ NÒNG CỐT CỦA UNISYNAPSE TRONG KHÔNG GIAN 3D

Dưới đây là mã nguồn hoàn chỉnh của 4 phân hệ tính năng quan trọng nhất trong ứng dụng **UniSynapse** (`https://unisynapse.netlify.app/`), được chuyển hóa từ giao diện 2D phẳng thông thường sang không gian 3D tương tác đa chiều:

### 22.1. Phân Hệ 01: Trạm Thao Tác Gán Nhãn Dữ Liệu AI 3D (`DataLabelingWorkbench3D.js`)
```javascript
import * as THREE from "three";

/**
 * Bàn làm việc gán nhãn dữ liệu AI trực tiếp trên bề mặt vật thể 3D
 */
export class DataLabelingWorkbench3D {
  constructor(scene, camera, domOverlayContainer) {
    this.scene = scene;
    this.camera = camera;
    this.container = domOverlayContainer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.annotationPoints = [];
    this.currentTask = {
      id: "TASK-8941",
      title: "Phân vùng cảm biến LiDAR xe tự hành",
      domain: "Computer Vision",
      reward: 350
    };

    this.initInspectableObject();
    this.setupRaycasting();
  }

  initInspectableObject() {
    // Vật thể cần gán nhãn: Khối cảm biến đa diện vát cạnh
    const geom = new THREE.DodecahedronGeometry(3.0, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x161e2e,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.6,
      wireframe: false
    });
    this.targetMesh = new THREE.Mesh(geom, mat);
    this.targetMesh.position.set(0, 0, 0);
    this.scene.add(this.targetMesh);

    // Lớp khung wireframe phụ trợ
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.2 });
    this.wireMesh = new THREE.Mesh(geom, wireMat);
    this.targetMesh.add(this.wireMesh);
  }

  setupRaycasting() {
    window.addEventListener("click", (e) => {
      // Chỉ bắt sự kiện khi không click vào thẻ UI
      if (e.target.closest(".interactive-ui")) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.targetMesh);

      if (intersects.length > 0) {
        const hit = intersects[0];
        this.addAnnotationPoint(hit.point, hit.face);
      }
    });
  }

  addAnnotationPoint(worldPos, face) {
    // 1. Tạo chấm điểm neo 3D
    const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f5a0 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(worldPos);
    this.scene.add(dot);

    // 2. Tạo nhãn HTML tương ứng
    const label = document.createElement("div");
    label.className = "annotation-tag interactive-ui font-mono text-[10px]";
    label.innerHTML = `
      <span class="text-emerald-400 font-bold">TAG #${this.annotationPoints.length + 1}</span>
      <span class="text-slate-300">CONFIDENCE: 98.4%</span>
    `;
    this.container.appendChild(label);

    this.annotationPoints.push({ mesh: dot, dom: label, pos: worldPos });
  }

  update() {
    // Xoay nhẹ vật thể
    this.targetMesh.rotation.y += 0.003;
    this.wireMesh.rotation.x += 0.002;

    // Cập nhật vị trí các nhãn HTML 2D theo điểm neo 3D
    this.annotationPoints.forEach(pt => {
      const v = pt.pos.clone().project(this.camera);
      if (v.z < 1.0) {
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
        pt.dom.style.transform = `translate(${x + 15}px, ${y - 15}px)`;
        pt.dom.style.opacity = "1";
      } else {
        pt.dom.style.opacity = "0";
      }
    });
  }
}
```

### 22.2. Phân Hệ 02: Cây Bằng Chứng Mật Mã Merkle Tree 3D (`ProofExplorerMerkle3D.js`)
```javascript
/**
 * Trực quan hóa cây Merkle Proof trong không gian 3D
 */
export class ProofExplorerMerkle3D {
  constructor(scene) {
    this.scene = scene;
    this.nodes = [];
    this.lines = [];
    this.buildMerkleTree(3); // 3 tầng cây Merkle (8 lá)
  }

  buildMerkleTree(depth = 3) {
    const nodeGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4);
    const rootMat = new THREE.MeshStandardMaterial({ color: 0x9945ff, emissive: 0x3d007a, metalness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.8 });

    for (let d = 0; d < depth; d++) {
      const count = Math.pow(2, d);
      const y = (depth - d) * 2.5;
      const spacing = 16.0 / (count + 1);

      for (let i = 0; i < count; i++) {
        const x = (i + 1) * spacing - 8.0;
        const mesh = new THREE.Mesh(nodeGeo, d === 0 ? rootMat : leafMat);
        mesh.position.set(x, y, 0);
        this.scene.add(mesh);
        this.nodes.push({ mesh, level: d, index: i });
      }
    }
  }

  highlightProofPath(leafIndex) {
    // Kích hoạt đường truyền ánh sáng từ lá được chọn lên Gốc Merkle (Root)
    console.log(`[MERKLE PROOF] Verifying cryptographic path for Leaf #${leafIndex}...`);
  }
}
```

### 22.3. Phân Hệ 03: Khối Cầu Ngữ Nghĩa AI Tutor Phản Ứng Theo Âm Thanh (`AITutorSemanticNexus3D.js`)
```javascript
/**
 * Trợ lý AI Tutor dưới dạng khối cầu lượng tử phản hồi theo giọng nói
 */
export class AITutorSemanticNexus3D {
  constructor(scene) {
    this.scene = scene;
    this.geometry = new THREE.IcosahedronGeometry(2.2, 3);
    this.origPositions = this.geometry.attributes.position.clone();
    
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x082f49,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: true
    });
    
    this.nexusMesh = new THREE.Mesh(this.geometry, this.material);
    this.nexusMesh.position.set(0, 3, -15);
    this.scene.add(this.nexusMesh);
  }

  pulseWithVoiceAmplitude(amplitude) {
    const pos = this.geometry.attributes.position;
    const orig = this.origPositions;
    for (let i = 0; i < pos.count; i++) {
      const factor = 1.0 + Math.sin(i + amplitude * 10.0) * amplitude * 0.3;
      pos.setXYZ(i, orig.getX(i) * factor, orig.getY(i) * factor, orig.getZ(i) * factor);
    }
    pos.needsUpdate = true;
  }
}
```

### 22.4. Phân Hệ 04: Kho Két Thanh Khoản Solana Devnet & Học Bổng UP (`SolanaDevnetStaking3D.js`)
```javascript
/**
 * Máy gia tốc thanh khoản tự động giải ngân UP Token trên Solana Devnet
 */
export class SolanaDevnetStaking3D {
  constructor(scene) {
    this.scene = scene;
    this.poolMesh = null;
    this.particleSystem = null;
    this.initPool();
  }

  initPool() {
    const torusGeo = new THREE.TorusGeometry(3.5, 0.4, 16, 64);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: 0x9945ff,
      emissive: 0x2e0854,
      metalness: 0.9,
      roughness: 0.15
    });
    this.poolMesh = new THREE.Mesh(torusGeo, torusMat);
    this.poolMesh.rotation.x = Math.PI / 2;
    this.scene.add(this.poolMesh);
  }

  simulateDisbursement(onSuccess) {
    let countdown = 3.2;
    const interval = setInterval(() => {
      countdown -= 0.1;
      if (countdown <= 0) {
        clearInterval(interval);
        if (onSuccess) onSuccess("TX-5Kn...9Zx (Confirmed on Solana Devnet)");
      }
    }, 100);
  }
}
```

## 23. HỆ THỐNG GIAO DIỆN HUD TELEMETRY & THIẾT KẾ ĐỒ HỌA CYBERNETIC TOÀN DIỆN

Dưới đây là toàn bộ mã nguồn CSS Design System quy chuẩn dành cho lớp giao diện HUD phía trên canvas 3D:

```css
/* ==========================================================================
   UNISYNAPSE 3D HUD & CYBERNETIC DESIGN SYSTEM (VANILLA CSS TOKENS)
   ========================================================================== */

:root {
  --color-void: #040508;
  --color-surface-obsidian: rgba(8, 12, 20, 0.78);
  --color-surface-hover: rgba(14, 20, 36, 0.90);
  
  --color-cyan-electric: #00f2fe;
  --color-cyan-glow: rgba(0, 242, 254, 0.35);
  --color-emerald-bft: #00f5a0;
  --color-solana-purple: #9945ff;
  --color-ice-blue: #8ec5fc;
  
  --font-heading: "Syne", "Space Grotesk", sans-serif;
  --font-data: "JetBrains Mono", monospace;
  
  --border-glass: 1px solid rgba(255, 255, 255, 0.08);
  --border-cyan-active: 1px solid rgba(0, 242, 254, 0.5);
  --backdrop-blur: blur(24px);
}

/* Khung Radar Scope Hàng Không */
.radar-scope-widget {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: radial-gradient(circle, rgba(0, 242, 254, 0.05) 0%, rgba(4, 5, 8, 0.8) 70%);
  overflow: hidden;
}

.radar-sweep-line {
  position: absolute;
  top: 50%; left: 50%;
  width: 50%;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 242, 254, 0) 0%, #00f2fe 100%);
  transform-origin: left center;
  animation: radarRotate 4s linear infinite;
}

@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Vòng tròn ngắm bắn mục tiêu Reticle */
.crosshair-reticle {
  position: fixed;
  top: 50%; left: 50%;
  width: 44px; height: 44px;
  border: 1px dashed rgba(0, 242, 254, 0.45);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 50;
}

/* Hiệu ứng viền phát sáng chạy vòng quanh nút (Border Beam Animation) */
.btn-cyber-beam {
  position: relative;
  background: rgba(10, 15, 26, 0.85);
  border: 1px solid rgba(0, 242, 254, 0.25);
  color: #ffffff;
  padding: 10px 22px;
  font-family: var(--font-data);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.btn-cyber-beam:hover {
  border-color: var(--color-cyan-electric);
  box-shadow: 0 0 25px rgba(0, 242, 254, 0.3);
}

.btn-cyber-beam::after {
  content: "";
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(transparent, transparent, var(--color-cyan-electric), transparent);
  animation: borderRotate 3s linear infinite;
  z-index: -1;
}

@keyframes borderRotate {
  100% { transform: rotate(1turn); }
}

/* Bảng Chỉ Số Đo Lường Telemetry Sparkline */
.sparkline-widget {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
}
.sparkline-widget span {
  width: 4px;
  background: var(--color-cyan-electric);
  border-radius: 1px;
  opacity: 0.7;
  transition: height 0.2s ease;
}
```

## 24. KIẾN TRÚC KẾT NỐI TRẠNG THÁI ZUSTAND VỚI WEBGL CANVAS (GLOBAL STATE BRIDGE)

Để các thành phần giao diện React/Next.js có thể điều khiển camera 3D và ngược lại (khi camera bay qua một trạm mốc thì React UI tự động cập nhật tab tương ứng), ta thiết lập một **Zustand State Bridge** tập trung:

```typescript
// stores/useWeb3DStore.ts
import { create } from "zustand";

export interface Web3DState {
  activeWaypoint: number;
  isAudioMuted: boolean;
  currentFPS: number;
  activeTelemetry: {
    latitude: string;
    longitude: string;
    bftConsensus: number;
    totalNodes: number;
    activeTasks: number;
  };
  cameraMode: "cinematic" | "orbit_inspect" | "drone_free";
  selectedNodeId: string | null;
  
  // Actions
  setActiveWaypoint: (index: number) => void;
  toggleAudioMute: () => void;
  setFPS: (fps: number) => void;
  setCameraMode: (mode: "cinematic" | "orbit_inspect" | "drone_free") => void;
  selectNode: (nodeId: string | null) => void;
}

export const useWeb3DStore = create<Web3DState>((set) => ({
  activeWaypoint: 0,
  isAudioMuted: true,
  currentFPS: 60,
  activeTelemetry: {
    latitude: "37.7749° N",
    longitude: "122.4194° W",
    bftConsensus: 80.4,
    totalNodes: 1902230,
    activeTasks: 42
  },
  cameraMode: "cinematic",
  selectedNodeId: null,

  setActiveWaypoint: (index) => set({ activeWaypoint: index }),
  toggleAudioMute: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  setFPS: (fps) => set({ currentFPS: fps }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId })
}));
```

### 24.1. Quy Trình Nâng Cấp Giao Diện Hiện Tại Của UniSynapse
1. Giữ nguyên toàn bộ logic backend FastAPI và kết nối Solana tại `backend/api/v1/`.
2. Tại `frontend/src/app/page.tsx`, tách phần hiển thị danh sách nhiệm vụ thành một tầng HTML HUD bán trong suốt nằm ở Z-Index 20.
3. Đặt `<WorldExperience3D />` ở Z-Index 1 toàn màn hình làm phông nền động.
4. Khi người dùng click vào một Challenge Card, gọi `useWeb3DStore.getState().selectNode(challenge.id)` để camera 3D tự động phóng tới khối kiến trúc tương ứng trong thành phố!


---

## 25. KẾT LUẬN & CHUẨN MỰC BÀN GIAO

Kỹ năng này là bản quy chuẩn tối thượng định hình toàn bộ năng lực sản xuất Web 3D của hệ thống UniSynapse. Mọi dòng code, mọi shader và mọi mô hình được tạo ra từ nay về sau phải tuân thủ nghiêm ngặt các nguyên lý hình học vát cạnh, bảng màu Cybernetic Obsidian, hệ thống đèn Studio 3 điểm, âm thanh Foley và độ mượt mà 60FPS tuyệt đối.

## 26. THƯ VIỆN TOÁN HỌC GLSL NOISE CHUYÊN SÂU (PROCEDURAL SHADER NOISE ENCYCLOPEDIA)

Để tạo ra các bề mặt kim loại bị phong hóa, hiệu ứng khói sương thể tích và các dòng chảy hạt lượng tử chuyển động tự nhiên như trong các website đạt giải Site of the Year, dưới đây là bộ thư viện hàm nhiễu toán học viết bằng **GLSL thuần túy** sẵn sàng nhúng vào bất kỳ ShaderMaterial nào:

### 26.1. Thuật Toán Simplex Noise 2D Trong GLSL
```glsl
// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
```

### 26.2. Thuật Toán Fractional Brownian Motion (FBM) 6 Bát Độ (6 Octaves)
```glsl
// Tạo kết cấu địa hình hoặc mây khói nhiều tầng bậc chi tiết
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    // 6 Bát độ lặp (6 Octaves)
    for (int i = 0; i < 6; i++) {
        value += amplitude * snoise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

### 26.3. Thuật Toán Curl Noise 3D Cho Luồng Hạt Bay Lượn Kháng Phân Kỳ
```glsl
// Curl Noise đảm bảo trường vector không có điểm tụ (Divergence-free)
// Giúp các hạt bụi ánh sáng chuyển động tự nhiên như làn khói mềm
vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    float n1 = snoise(vec2(p.x, p.y + e));
    float n2 = snoise(vec2(p.x, p.y - e));
    float n3 = snoise(vec2(p.z + e, p.y));
    float n4 = snoise(vec2(p.z - e, p.y));
    float n5 = snoise(vec2(p.x, p.z + e));
    float n6 = snoise(vec2(p.x, p.z - e));
    
    float x = (n2 - n1) - (n4 - n3);
    float y = (n4 - n3) - (n6 - n5);
    float z = (n6 - n5) - (n2 - n1);
    
    return normalize(vec3(x, y, z));
}
```

### 26.4. Shader Bào Mòn Cạnh Kim Loại Thủ Tục (Procedural Edge Wear)
```glsl
// Tự động làm sáng gờ cạnh kim loại như bị cọ xát cơ học mà không cần vẽ texture tay
uniform vec3 uBaseColor;
uniform vec3 uEdgeColor;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    float noise = fbm(vWorldPosition.xz * 4.0);
    float edgeFactor = length(fwidth(vNormal)) * 4.0;
    float wear = clamp(edgeFactor + noise * 0.3, 0.0, 1.0);
    vec3 finalColor = mix(uBaseColor, uEdgeColor, wear);
    gl_FragColor = vec4(finalColor, 1.0);
}
```

## 27. MẪU TRIỂN KHAI HOÀN CHỈNH TESLA CYBERTRUCK 3D CONFIGURATOR (STANDALONE DEMO)

Dưới đây là toàn bộ mã nguồn của trang web giới thiệu sản phẩm 3D tương tác theo phong cách của **Mariusz Mitkow (Video 6)**. Trang web cho phép xoay xe 360 độ, bộc lộ các điểm Hotspot linh kiện và đổi chế độ chiếu sáng:

```html
<!DOCTYPE html>
<html lang="en" class="h-full bg-[#060709] text-white">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cybertruck 3D Interactive Configurator — Awwwards Style</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Syne", sans-serif; background: #060709; overflow: hidden; height: 100vh; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    #canvas-container { position: absolute; inset: 0; z-index: 1; }
    #svg-layer { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
    .ui-layer { position: absolute; inset: 0; z-index: 10; pointer-events: none; padding: 2.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .interactive { pointer-events: auto; }
    .hud-panel { background: rgba(14, 18, 28, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 1.5rem; border-radius: 12px; }
    .hotspot-tag { position: absolute; background: rgba(6, 10, 18, 0.88); border: 1px solid #00f2fe; padding: 8px 14px; border-radius: 6px; font-family: "JetBrains Mono"; font-size: 11px; pointer-events: auto; transform: translate(20px, -20px); transition: opacity 0.2s; }
  </style>
</head>
<body>
  <div id="canvas-container"><canvas id="cybertruck-canvas"></canvas></div>
  <svg id="svg-layer"></svg>
  <div id="tag-glass" class="hotspot-tag" style="opacity: 0;">ARMOR GLASS // SHATTERPROOF</div>
  <div id="tag-steel" class="hotspot-tag" style="opacity: 0;">ULTRA-HARD 30X COLD-ROLLED STEEL</div>
  <div class="ui-layer">
    <header style="display: flex; justify-content: space-between; align-items: center;">
      <div><h1 style="font-size: 1.5rem; font-weight: 800; letter-spacing: 0.1em;">CYBERTRUCK</h1><p class="font-mono" style="font-size: 0.75rem; color: #00f2fe;">SPECIFICATION INSPECTOR</p></div>
      <div class="hud-panel interactive" style="display: flex; gap: 1rem;"><button id="btn-explode" class="font-mono" style="background: rgba(0,242,254,0.1); border: 1px solid #00f2fe; color: #00f2fe; padding: 8px 16px; border-radius: 6px; cursor: pointer;">EXPLODED VIEW</button></div>
    </header>
    <footer style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div class="hud-panel font-mono" style="display: flex; gap: 2.5rem;">
        <div><div style="color: #94a3b8; font-size: 0.7rem;">0-60 MPH</div><strong style="font-size: 1.5rem; color: #ffffff;">2.6 SEC</strong></div>
        <div><div style="color: #94a3b8; font-size: 0.7rem;">PAYLOAD</div><strong style="font-size: 1.5rem; color: #ffffff;">2,500 LBS</strong></div>
        <div><div style="color: #94a3b8; font-size: 0.7rem;">TOWING</div><strong style="font-size: 1.5rem; color: #00f2fe;">11,000 LBS</strong></div>
      </div>
    </footer>
  </div>
  <script>
    const canvas = document.getElementById("cybertruck-canvas");
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060709, 0.02);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(12, 6, 14);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Không cho camera chui xuống lòng đất
    controls.minDistance = 6;
    controls.maxDistance = 28;

    // Lighting
    const sun = new THREE.DirectionalLight(0xffffff, 3.5); sun.position.set(15, 25, 15); scene.add(sun);
    const blueRim = new THREE.DirectionalLight(0x70b0ff, 4.0); blueRim.position.set(-15, 10, -15); scene.add(blueRim);
    scene.add(new THREE.HemisphereLight(0x1a2638, 0x060709, 0.4));

    // Ground Mirror Grid
    const grid = new THREE.GridHelper(50, 25, 0x00f2fe, 0x1e293b); grid.position.y = -0.01; scene.add(grid);

    // Dựng xe Cybertruck Procedural
    const steelMat = new THREE.MeshPhysicalMaterial({ color: 0x8a929e, metalness: 0.95, roughness: 0.16, clearcoat: 0.8, clearcoatRoughness: 0.1 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a1018, metalness: 0.1, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.85 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.8 });

    const truckGroup = new THREE.Group();
    // Thân dưới
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.4, 3.8), steelMat); lowerBody.position.y = 1.2; truckGroup.add(lowerBody);
    // Mui xe hình tam giác đặc trưng
    const roofGeo = new THREE.CylinderGeometry(0.1, 4.2, 4.2, 3); roofGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, steelMat); roof.position.set(0, 3.1, 0); roof.scale.set(1.9, 0.8, 0.85); truckGroup.add(roof);
    // Kính xe
    const glass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 3.5), glassMat); glass.position.set(0.5, 2.5, 0); truckGroup.add(glass);
    // 4 Bánh xe
    const wGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.8, 24); wGeo.rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wGeo, wheelMat); wFL.position.set(2.8, 0.9, 1.9); truckGroup.add(wFL);
    const wFR = new THREE.Mesh(wGeo, wheelMat); wFR.position.set(2.8, 0.9, -1.9); truckGroup.add(wFR);
    const wBL = new THREE.Mesh(wGeo, wheelMat); wBL.position.set(-2.8, 0.9, 1.9); truckGroup.add(wBL);
    const wBR = new THREE.Mesh(wGeo, wheelMat); wBR.position.set(-2.8, 0.9, -1.9); truckGroup.add(wBR);
    // Đèn pha LED trước
    const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 3.6), new THREE.MeshBasicMaterial({ color: 0xffffff })); lightbar.position.set(4.55, 1.85, 0); truckGroup.add(lightbar);
    scene.add(truckGroup);

    // Hotspot coordinates
    const hpGlass = new THREE.Vector3(0.5, 2.7, 1.75);
    const hpSteel = new THREE.Vector3(3.2, 1.5, 1.9);
    const tagG = document.getElementById("tag-glass");
    const tagS = document.getElementById("tag-steel");
    const svg = document.getElementById("svg-layer");
    const pathG = document.createElementNS("http://www.w3.org/2000/svg", "path"); pathG.setAttribute("stroke", "#00f2fe"); pathG.setAttribute("fill", "none"); pathG.setAttribute("stroke-dasharray", "4 2"); svg.appendChild(pathG);
    const pathS = document.createElementNS("http://www.w3.org/2000/svg", "path"); pathS.setAttribute("stroke", "#00f2fe"); pathS.setAttribute("fill", "none"); pathS.setAttribute("stroke-dasharray", "4 2"); svg.appendChild(pathS);

    function updateTags() {
      function place(hp, tag, path) {
        const v = hp.clone().project(camera);
        if (v.z > 1.0) { tag.style.opacity = "0"; path.style.opacity = "0"; return; }
        tag.style.opacity = "1"; path.style.opacity = "1";
        const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-(v.y * 0.5) + 0.5) * window.innerHeight;
        tag.style.transform = `translate(${sx + 30}px, ${sy - 30}px)`;
        path.setAttribute("d", `M ${sx} ${sy} L ${sx + 30} ${sy - 15}`);
      }
      place(hpGlass, tagG, pathG);
      place(hpSteel, tagS, pathS);
    }

    // Exploded View Trigger
    let exploded = false;
    document.getElementById("btn-explode").addEventListener("click", () => {
      exploded = !exploded;
      gsap.to(roof.position, { y: exploded ? 4.8 : 3.1, duration: 1.0, ease: "power2.inOut" });
      gsap.to(glass.position, { y: exploded ? 3.8 : 2.5, duration: 1.0, ease: "power2.inOut" });
      document.getElementById("btn-explode").textContent = exploded ? "RESET VIEW" : "EXPLODED VIEW";
    });

    // Post-Processing
    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85));

    function animate() {
      controls.update();
      updateTags();
      composer.render();
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```

## 28. BÓC TÁCH CÁC CASE STUDY KINH ĐIỂN THẾ GIỚI (AWWWARDS OF THE YEAR)

Để đạt đến đỉnh cao của nghệ thuật WebGL, chúng ta cần nghiên cứu sâu kiến trúc của những tượng đài trong làng sáng tạo số thế giới:

### 28.1. Case Study Lusion.co: Mô Phỏng Chất Lỏng & Hạt Lượng Tử Thời Gian Thực
- **Kỹ thuật đột phá**: Lusion không dùng các model 3D tĩnh mà sử dụng **GPU Computation Shaders** (chạy trên WebGL Float Render Targets). Hàng trăm ngàn hạt chất lỏng được tính toán vị trí, vận tốc và va chạm trực tiếp trong Fragment Shader thay vì chạy bằng CPU.
- **Chiếu sáng & Phản xạ**: Sử dụng kỹ thuật **Screen-Space Reflections (SSR)** và **Subsurface Scattering (SSS)** để tạo độ trong suốt và độ tán xạ ánh sáng dưới da/chất lỏng.

### 28.2. Case Study Active Theory: Kiến Trúc Micro-WebGL & Asset Streaming
- **Kỹ thuật đột phá**: Studio Active Theory phát triển engine riêng (Hydra) dựa trên triết lý **Data-Driven WebGL**:
  1. Không tải toàn bộ 3D scene cùng lúc; chia nhỏ cảnh vật thành các khối nén nhị phân theo từng phòng.
  2. Camera di chuyển đến đâu, hệ thống tự động tải ngầm (Stream) các khối dữ liệu tiếp theo.
  3. Hủy bỏ ngay các tài nguyên ở phía sau lưng camera để giữ mức tiêu hao RAM luôn dưới 80MB.

### 28.3. Case Study Portfolio Của Bruno Simon: Vật Lý Động Lực Học Xe Hơi (Rapier / Cannon.js)
- **Kỹ thuật đột phá**: Tích hợp công cụ vật lý **Cannon-es** hoặc **Rapier WASM** vào Three.js:
  - Chiếc xe nhỏ màu đỏ có hệ thống treo 4 bánh độc lập, lực ma sát lốp xe và quán tính va đập.
  - Các khối chữ và rào chắn có thân vật lý RigidBody (hộp, trụ). Khi xe tông vào, các khối chữ văng ra với vận tốc góc chuẩn xác theo định luật Newton.

```javascript
// Mẫu tích hợp Cannon-es với Three.js cho xe di chuyển trong thành phố
import * as CANNON from "cannon-es";

export function initVehiclePhysics(scene) {
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  // Mặt sàn vật lý
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane()
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Thân xe
  const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
  const chassisBody = new CANNON.Body({ mass: 150 });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 4, 0);
  world.addBody(chassisBody);

  return { world, chassisBody };
}
```


---

## 29. KẾT NỐI WEBSOCKET REAL-TIME TỪ FASTAPI ĐẾN WEBGL THREE.JS

Để thành phố 3D trong UniSynapse phản ánh đúng dữ liệu thực tế (khi có sinh viên nộp bài gán nhãn AI hoặc có giao dịch Solana mới, tòa tháp tương ứng sẽ bừng sáng), ta xây dựng đường truyền **WebSocket hai chiều tốc độ cao**:

### 29.1. Backend FastAPI: WebSocket Stream Server (`backend/api/v1/telemetry_stream.py`)
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import random

router = APIRouter()

class TelemetryConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = TelemetryConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Giả lập phát sóng nhịp đập mạng lưới (Network Heartbeat) mỗi 2 giây
            await asyncio.sleep(2.0)
            telemetry_data = {
                "type": "TELEMETRY_PULSE",
                "active_nodes": 1902230 + random.randint(-15, 25),
                "bft_consensus": round(80.2 + random.uniform(-0.4, 0.6), 2),
                "tps": random.randint(280, 420),
                "active_block": random.randint(1000, 9999),
                "pulse_node_index": random.randint(0, 15) # Tòa tháp cần kích hoạt vệt sáng
            }
            await websocket.send_text(json.dumps(telemetry_data))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

### 29.2. Frontend: Client Nhận WebSocket & Bắn Tín Hiệu Vào Three.js Mesh
```javascript
export function connectTelemetryWebSocket(cityInstancedMesh, radarShader) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/telemetry`;
  
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[TELEMETRY WS] Connected to UniSynapse Real-time Stream.");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "TELEMETRY_PULSE") {
        // Cập nhật số liệu trên HUD 2D
        const nodeEl = document.getElementById("hud-nodes-count");
        if (nodeEl) nodeEl.textContent = data.active_nodes.toLocaleString();
        
        const bftEl = document.getElementById("hud-bft-gauge");
        if (bftEl) bftEl.textContent = `${data.bft_consensus}%`;

        // Kích hoạt bừng sáng tòa tháp tương ứng trong 3D
        if (cityInstancedMesh && data.pulse_node_index !== undefined) {
          const idx = data.pulse_node_index;
          const highlightColor = new THREE.Color(0x00f2fe);
          cityInstancedMesh.setColorAt(idx, highlightColor);
          cityInstancedMesh.instanceColor.needsUpdate = true;

          // Trả lại màu kim loại sau 800ms
          setTimeout(() => {
            cityInstancedMesh.setColorAt(idx, new THREE.Color(0x121620));
            cityInstancedMesh.instanceColor.needsUpdate = true;
          }, 800);
        }
      }
    } catch (e) {
      console.error("Lỗi phân tích WebSocket telemetry:", e);
    }
  };

  socket.onerror = (err) => {
    console.warn("[TELEMETRY WS] Lỗi kết nối WebSocket:", err);
  };
}
```


---

## 30. TỔNG KẾT BẢN QUY CHUẨN KỸ THUẬT & LỜI TUYÊN NGÔN

Kỹ năng `awwwards-web3d-production` thiết lập một chuẩn mực mới không thể xô đổ cho các sản phẩm Web 3D của UniSynapse:
1. **Không thỏa hiệp với sự tầm thường**: Mọi hình học đều phải có độ vát (Bevel), mọi ánh sáng đều phải có bóng đổ điện ảnh và độ tương phản.
2. **Hòa quyện tuyệt đối**: 3D không đứng một mình, 2D không đứng ngoài cuộc. Cả hai gắn kết với nhau bằng tọa độ không gian, đường chỉ dẫn SVG và bảng đo lường Telemetry.
3. **Hiệu năng là danh dự**: Luôn tối ưu hóa đạt 60FPS tuyệt đối trên mọi thiết bị.

## 31. PHỤ LỤC A: MA TRẬN SO SÁNH CÁC CÔNG NGHỆ ĐỒ HỌA WEB (SELECTION MATRIX)

Khi đứng trước một bài toán giao diện mới cho UniSynapse, kỹ sư cần lựa chọn công cụ phù hợp nhất dựa trên bảng ma trận kỹ thuật dưới đây:

| Tiêu chí đánh giá | Three.js (WebGL 2.0) | React Three Fiber (R3F) | Spline 3D Runtime | CSS 3D Transforms | Pixi.js (2D WebGL) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mục đích tối ưu** | Đại đô thị, Custom Shaders, Hàng ngàn vật thể | Ứng dụng Next.js/React phức tạp | Showroom xe hơi, sản phẩm đơn lẻ | Card xoay 3D nhẹ, lật trang | Đồ họa hạt 2D, biểu đồ phẳng |
| **Khả năng kiểm soát Shaders** | 100% Tuyệt đối | 100% Tuyệt đối | Rất hạn chế | 0% (Không hỗ trợ) | 90% (2D Shaders) |
| **Kích thước thư viện (Bundle)** | ~140 KB (Gzip) | ~180 KB (Gzip) | ~1.2 MB (Nặng) | 0 KB (Trình duyệt gốc) | ~110 KB (Gzip) |
| **Tốc độ làm chủ (Learning Curve)**| Cao (Toán vector & ma trận) | Cao (React lifecycle + WebGL) | Rất nhanh (Kéo thả trực quan)| Rất thấp (CSS thuần) | Trung bình |
| **Hiệu năng Render 60FPS** | Cực cao (Tối ưu thủ công) | Cực cao nếu memoize tốt | Trung bình (Nhiều overhead) | Thấp nếu quá 30 phần tử | Rực rỡ cho 2D Sprites |
| **Tích hợp DOM / Accessibility** | Cần chiếu tọa độ thủ công | Tích hợp sâu qua `<Html>` | Hạn chế | Hoàn hảo cho SEO/A11y | Cần xử lý riêng biệt |

### 31.1. Khi Nào Nên Dùng Công Nghệ Nào Trong Dự Án UniSynapse?
1. **Dùng Three.js Vanilla**: Dành cho trang Landing Page chủ đạo (`giaodientest/master_web3d_unisynapse.html`), nơi cần tối ưu từng micro-giây của Render Loop, kiểm soát 100% bộ đệm InstancedMesh và Custom GLSL Shaders.
2. **Dùng React Three Fiber (R3F)**: Dành cho trang Dashboard người dùng (`frontend/src/app/page.tsx`), nơi dữ liệu người dùng thay đổi liên tục theo State của Next.js.
3. **Dùng Spline 3D**: Dành cho các phân cảnh giới thiệu linh kiện phần cứng hoặc các huy hiệu phần thưởng 3D (UP Token Badge) được thiết kế riêng bởi 3D Artist.
4. **Dùng CSS 3D Transforms**: Dành cho các thẻ nhiệm vụ đơn lẻ ở các màn hình phụ trợ không cần chiều sâu ánh sáng phức tạp.


---

## 32. PHỤ LỤC B: KIỂM THỬ HỒI QUY THỊ GIÁC TỰ ĐỘNG CHO WEBGL (AUTOMATED VISUAL TESTING)

Đồ họa WebGL rất dễ bị vỡ hình khi cập nhật CSS hoặc phiên bản trình duyệt. Kỹ sư đồ họa sử dụng Playwright và Pixelmatch để chụp ảnh màn hình canvas và so sánh độ sai lệch màu:

```javascript
// tests/web3d_visual_regression.test.js
const { chromium } = require("playwright");
const fs = require("fs");
const pixelmatch = require("pixelmatch");
const { PNG } = require("pngjs");

async function runVisualRegressionTest() {
  console.log(">>> BẮT ĐẦU KIỂM THỬ HỒI QUY THỊ GIÁC CHO WEBGL CANVAS...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("http://localhost:3000/web3d");

  // Chờ 3 giây để WebGL biên dịch xong toàn bộ Shaders
  await page.waitForTimeout(3000);

  // Chụp ảnh màn hình Canvas hiện tại
  const screenshotBuffer = await page.locator("#webgl-canvas").screenshot();
  fs.writeFileSync("current_render.png", screenshotBuffer);

  // So sánh với ảnh mẫu chuẩn (Golden Master)
  if (fs.existsSync("golden_master.png")) {
    const img1 = PNG.sync.read(fs.readFileSync("golden_master.png"));
    const img2 = PNG.sync.read(screenshotBuffer);
    const diff = new PNG({ width: img1.width, height: img1.height });

    const numDiffPixels = pixelmatch(
      img1.data, img2.data, diff.data, img1.width, img1.height,
      { threshold: 0.1 }
    );

    console.log(`Số pixel sai lệch màu: ${numDiffPixels}`);
    if (numDiffPixels > 50) {
      fs.writeFileSync("diff.png", PNG.sync.write(diff));
      throw new Error("Cảnh báo: Đồ họa WebGL bị sai lệch vượt ngưỡng cho phép!");
    } else {
      console.log(">>> KIỂM THỬ THÀNH CÔNG: KHÔNG CÓ SAI LỆCH THỊ GIÁC!");
    }
  } else {
    console.log("Đã lưu ảnh mẫu chuẩn Golden Master lần đầu.");
    fs.writeFileSync("golden_master.png", screenshotBuffer);
  }

  await browser.close();
}
```


---

## 33. PHỤ LỤC C: TỪ ĐIỂN THUẬT NGỮ ĐỒ HỌA MÁY TÍNH DÀNH CHO KỸ SƯ WEBGL

1. **Frustum (Hình chóp cụt tầm nhìn)**: Thể tích không gian 3 chiều mà camera có thể nhìn thấy được. Mọi vật thể nằm ngoài Frustum cần được loại bỏ khỏi quá trình vẽ (**Frustum Culling**) để tiết kiệm GPU.
2. **Draw Call (Lệnh vẽ GPU)**: Lệnh từ CPU gửi tới GPU yêu cầu vẽ một tập hợp các đỉnh. Trong Web 3D, số lượng Draw Calls trên một khung hình nên được duy trì dưới 50 để đảm bảo 60FPS.
3. **InstancedMesh**: Kỹ thuật vẽ hàng ngàn bản sao của một vật thể trong đúng 1 lệnh vẽ duy nhất, mỗi bản sao có vị trí, góc xoay, tỷ lệ và màu sắc riêng.
4. **PBR (Physically-Based Rendering)**: Mô hình chiếu sáng dựa trên các quy luật vật lý quang học thực tế, bao gồm bảo toàn năng lượng ánh sáng và vi cấu trúc bề mặt.
5. **Roughness (Độ nhám)**: Độ nhấp nhô tế vi của bề mặt vật thể. Roughness càng thấp thì vệt phản quang càng sắc nét; Roughness càng cao thì ánh sáng càng tán xạ mờ.
6. **Metalness (Tính kim loại)**: Xác định vật thể dẫn điện hay cách điện. Kim loại phản xạ màu sắc của chính nó và không có phản xạ khuếch tán (Diffuse = 0).
7. **Clearcoat (Lớp sơn bóng phủ ngoài)**: Lớp phủ bóng trong suốt nằm phía trên lớp vật liệu chính, thường thấy trên sơn xe hơi cao cấp hoặc bề mặt đá mài bóng.
8. **IOR (Index of Refraction)**: Chỉ số khúc xạ ánh sáng, quyết định tỷ lệ ánh sáng bị bẻ cong khi đi qua ranh giới giữa hai môi trường (Không khí: 1.0, Nước: 1.33, Thủy tinh: 1.52, Kim cương: 2.42).
9. **Normal Vector (Véc-tơ pháp tuyến)**: Véc-tơ có độ dài bằng 1, vuông góc với bề mặt đa giác, dùng để tính toán góc phản xạ của ánh sáng.
10. **Z-Fighting (Xung đột độ sâu)**: Hiện tượng nhấp nháy loang lổ khi hai mặt phẳng nằm quá sát nhau khiến GPU không phân định được mặt nào nằm trước.
11. **Tangent Space (Không gian tiếp tuyến)**: Hệ trục tọa độ cục bộ (Tangent, Bitangent, Normal) gắn liền với bề mặt đa giác, dùng để ánh xạ Normal Map.
12. **Tone Mapping**: Thuật toán nén dải tương phản động cao (HDR) về dải tương phản tiêu chuẩn (LDR) của màn hình máy tính mà không làm cháy trắng vùng sáng.
13. **ACES Filmic Tone Mapping**: Tiêu chuẩn biến đổi màu sắc của Viện Hàn lâm Điện ảnh Mỹ (Academy Color Encoding System), tạo màu đen sâu và dải sáng rực rỡ mang phong cách Hollywood.
14. **UnrealBloomPass**: Bộ lọc tạo quầng hào quang phát sáng mềm mại cho các vật thể có độ sáng vượt ngưỡng.
15. **Occlusion (Sự che khuất)**: Kiểm tra xem một điểm trong không gian có bị một vật thể khác chắn trước tầm nhìn của camera hay không.
16. **Raycasting**: Bắn một tia vô hình từ camera xuyên qua tọa độ chuột trên màn hình vào không gian 3D để xác định vật thể nào bị nhấp trúng.
17. **Frenet-Serret Frame**: Hệ tọa độ di động gắn liền với một đường cong 3D (Tiếp tuyến T, Pháp tuyến N, Trùng pháp tuyến B), giúp camera bay mượt mà theo đường cong.
18. **Catmull-Rom Spline**: Đường cong nội suy đi qua tất cả các điểm kiểm soát một cách êm ái mà không bị gãy góc.
19. **Draco Compression**: Thuật toán nguồn mở của Google nén dữ liệu lưới hình học 3D (Mesh) xuống còn 10-15% dung lượng gốc.
20. **KTX2 / Basis Universal**: Định dạng nén texture GPU chuyên dụng cho Web, giải nén trực tiếp vào bộ nhớ VRAM mà không cần giải nén trung gian sang PNG.

## 34. PHỤ LỤC D: SỔ TAY VẬN HÀNH KỸ THUẬT & QUY TRÌNH PHÁT TRIỂN (PRODUCTION RUNBOOK & SOP)

Để đảm bảo toàn bộ đội ngũ kỹ sư và thiết kế tại UniSynapse làm việc đồng bộ và giữ vững chất lượng Awwwards qua từng bản cập nhật, quy trình 7 bước phát triển chuẩn (Standard Operating Procedure - SOP) được quy định bắt buộc như sau:

### 34.1. Quy Trình 7 Bước Từ Ý Tưởng Thiết Kế Đến Bản Phát Hành Production

```
BƯỚC 1: Moodboard & Art Direction (Chọn bảng màu Cybernetic Obsidian, nguồn cảm hứng)
    │
    ▼
BƯỚC 2: Mô Hình Hóa 3D & Vát Cạnh (Blender / Procedural Three.js Chamfer Geometry)
    │
    ▼
BƯỚC 3: Thiết Lập Bộ Đèn Studio 3 Điểm & Thử Nghiệm Vật Liệu MeshPhysicalMaterial
    │
    ▼
BƯỚC 4: Lập Trình Custom Shaders & Bộ Xử Lý Hậu Kỳ (UnrealBloom + ACES Tone Mapping)
    │
    ▼
BƯỚC 5: Đồng Bộ Chuyển Động Camera Với Lenis Smooth Scroll & GSAP ScrollTrigger
    │
    ▼
BƯỚC 6: Xây Dựng Lớp Tương Tác 2D HUD, Dây Nối SVG & Hệ Thống Âm Thanh Web Audio Foley
    │
    ▼
BƯỚC 7: Kiểm Thử Hiệu Năng 60FPS Trên Di Động & Chạy Script Đối Soát 50 Tiêu Chí Xuất Xưởng
```

### 34.2. Cấu Hình Thích Ứng Đồ Họa Theo Từng Cấp Độ Phần Cứng GPU (Adaptive Hardware Tiering)

Một trang web chuyên nghiệp tự động nhận diện sức mạnh GPU của thiết bị người dùng và điều chỉnh đồ họa tương ứng để không bao giờ bị tụt dưới 55FPS:

| Hạng GPU (Hardware Tier) | Thiết bị mẫu điển hình | Chiến lược cấu hình WebGL tự động |
| :--- | :--- | :--- |
| **Tier 1 (High-End Desktop)** | NVIDIA RTX 3060+, Apple M1/M2/M3 Pro | Bật đầy đủ UnrealBloomPass, Shadow Map 2048px, MSAA 4x, 2500 hạt photon, DPR = 2.0 |
| **Tier 2 (Mid-Range Laptop)** | Intel Iris Xe, AMD Radeon 680M | Giảm Shadow Map 1024px, Bloom radius 0.3, 1000 hạt photon, DPR = 1.5 |
| **Tier 3 (Mobile Flagship)** | iPhone 14/15, Samsung Galaxy S23/S24 | Tắt Bloom Pass nặng, dùng Baked Textures, 500 hạt photon, DPR = 1.0, tắt đổ bóng mềm |
| **Tier 4 (Low-End Mobile)** | Thiết bị Android phổ thông cũ | Chuyển sang chế độ Fallback 2.5D Canvas, tắt hoàn toàn WebGL post-processing |

#### Đoạn Mã Tự Động Nhận Diện Cấp Độ Phần Cứng:
```javascript
export function detectGPUTier(renderer) {
  const gl = renderer.getContext();
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const gpuRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase() : "";

  console.log(`[GPU DETECTED] ${gpuRenderer}`);

  // Kiểm tra thiết bị di động
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isMobile) {
    return {
      tier: "mobile",
      pixelRatio: 1.0,
      enableBloom: false,
      shadowMapSize: 1024,
      particleCount: 500
    };
  }

  if (gpuRenderer.includes("nvidia") || gpuRenderer.includes("apple m") || gpuRenderer.includes("radeon rx")) {
    return {
      tier: "desktop-high",
      pixelRatio: Math.min(window.devicePixelRatio, 2.0),
      enableBloom: true,
      shadowMapSize: 2048,
      particleCount: 2500
    };
  }

  return {
    tier: "desktop-mid",
    pixelRatio: 1.25,
    enableBloom: true,
    shadowMapSize: 1024,
    particleCount: 1200
  };
}
```

### 34.3. Quy Trình Ứng Cứu Khẩn Cấp Khi Xảy Ra Sự Cố Đồ Họa (Incident Response Runbook)
Khi phát hiện người dùng gặp sự cố crash hoặc lag trên môi trường production, Kỹ sư trực ca kích hoạt quy trình ứng cứu 4 pha:
1. **Pha 1 - Hạ Cấp Tức Thì (Instant Graceful Degradation)**: Gửi biến cờ feature-flag `DISABLE_WEB3D_POSTPROCESSING=true` từ backend để tự động tắt UnrealBloomPass trên toàn bộ người dùng.
2. **Pha 2 - Cô Lập Vùng Lỗi (Isolate Failing Geometry)**: Kiểm tra thông qua Sentry logs xem lỗi phát sinh từ hàm shader nào hay do texture quá kích thước.
3. **Pha 3 - Chuyển Hướng Fallback (Route to Static Showcase)**: Nếu card đồ họa của người dùng không hỗ trợ WebGL 2.0, giao diện tự động hiển thị video hoạt ảnh MP4 lặp vòng chất lượng cao 60FPS ghi lại từ Three.js.
4. **Pha 4 - Tái Kiểm Định (Post-Mortem & Regression)**: Cập nhật lại bộ kiểm thử visual regression và bổ sung kiểm tra vào quy trình CI/CD.

### 34.4. Lời Kết Dành Cho Kỹ Sư UniSynapse
Công nghệ WebGL và Web 3D không ngừng phát triển, nhưng những nguyên lý về tỷ lệ thị giác, sự tương phản ánh sáng, nhịp điệu chuyển động và sự tôn trọng trải nghiệm người dùng luôn là bất biến. Hãy sử dụng kỹ năng này như một cuốn kim chỉ nam để xây dựng nên những sản phẩm số làm say đắm người dùng trên toàn thế giới.

## 35. PHỤ LỤC E: 30 CÂU HỎI & ĐÁP KỸ THUẬT HÓC BÚA NHẤT (EXPERT WEBGL FAQ)

Dưới đây là lời giải chi tiết cho 30 câu hỏi kỹ thuật thường gặp nhất khi triển khai các dự án Web 3D chuẩn Awwwards:

#### Q1: Tại sao hiệu ứng UnrealBloomPass làm mất tính năng trong suốt (Transparent Background) của Canvas?
- **Giải đáp**: Mặc định `EffectComposer` render ra một RenderTarget có nền đen để tính toán cường độ phát sáng. Để giữ nền trong suốt xuyên thấu xuống các phần tử HTML bên dưới, ta cần thiết lập `composer.renderTarget1.texture.format = THREE.RGBAFormat;` và cấu hình Shader Pass cuối cùng để bảo toàn kênh Alpha.

#### Q2: Làm sao để khử răng cưa (Antialiasing) khi sử dụng EffectComposer trong Three.js?
- **Giải đáp**: Trong WebGL 2.0, bạn có thể truyền thuộc tính `samples: 4` (MSAA 4x) vào bộ khởi tạo `WebGLRenderTarget`. Ngoài ra, bạn có thể thêm một pass khử răng cưa hậu kỳ chuyên dụng như `FXAAShader` hoặc `SMAAPass` vào cuối chuỗi EffectComposer.

#### Q3: Khi nào nên dùng `MeshBasicMaterial` thay cho `MeshStandardMaterial`?
- **Giải đáp**: Khi bạn đã nướng (Bake) toàn bộ ánh sáng và bóng đổ phức tạp từ Blender vào Texture Map. Lúc này `MeshBasicMaterial` hiển thị hình ảnh hoàn hảo 100% giống Blender mà GPU không tốn bất kỳ chu kỳ tính toán ánh sáng nào, đem lại 60FPS tuyệt đối trên mọi điện thoại di động.

#### Q4: Làm thế nào để ngăn chặn hiện tượng méo hình khi người dùng xoay ngang màn hình điện thoại?
- **Giải đáp**: Luôn lắng nghe sự kiện `resize` và `orientationchange`, cập nhật đồng thời `camera.aspect = window.innerWidth / window.innerHeight;` và bắt buộc phải gọi `camera.updateProjectionMatrix();`, đồng thời cập nhật kích thước cho cả `renderer` và `composer`.

#### Q5: Sự khác biệt giữa `DoubleSide`, `FrontSide` và `BackSide` trong Three.js là gì?
- **Giải đáp**: Mặc định Three.js chỉ render mặt trước (`FrontSide`) của đa giác dựa trên chiều kim đồng hồ của các đỉnh để tối ưu hóa hiệu năng (Backface Culling). Chỉ đặt `side: THREE.DoubleSide` khi vật thể thực sự là một mặt phẳng mỏng nhìn thấy được cả hai mặt (như tấm kính, cánh hoa, lá cờ), vì DoubleSide làm tăng gấp đôi số lượng phép tính bóng đổ.

#### Q6: Làm sao để camera CatmullRom bay mượt mà không bị lộn ngược đầu (Flipping Upside Down)?
- **Giải đáp**: Khi camera bay theo đường cong 3 chiều có góc nghiêng lớn, véc-tơ hướng lên (`camera.up`) có thể bị xung đột với hướng nhìn. Hãy tính toán khung tọa độ chuyển động Frenet-Serret Frame hoặc điều khiển góc quay bằng Quaternions thay vì gọi `camera.lookAt()` đơn thuần.

#### Q7: Tại sao bóng đổ (Shadows) trên các khối nhà lớn bị đứt đoạn hoặc nhạt nhòa?
- **Giải đáp**: Do hộp thể tích chiếu bóng (Shadow Camera Frustum) quá lớn so với độ phân giải của Shadow Map. Hãy thu hẹp các biên `shadow.camera.left`, `right`, `top`, `bottom` vừa khít với khu vực thành phố chính để tập trung mật độ pixel bóng đổ cao nhất.

#### Q8: Tại sao các font chữ 3D trong Three.js (FontLoader + TextGeometry) thường khiến file bị phình to?
- **Giải đáp**: `TextGeometry` sinh ra hàng ngàn đa giác nhỏ để tạo hình từng chữ cái, gây nặng nề cho GPU. Giải pháp hiện đại là sử dụng **MSDF Text (Multi-channel Signed Distance Fields)** hoặc đặt chữ bằng các thẻ HTML thông thường ở tầng HUD phía trên và dùng phép chiếu tọa độ 3D.

#### Q9: Làm sao để tránh hiện tượng màn hình trắng bệch khi người dùng cuộn ngược thật nhanh lên đầu trang?
- **Giải đáp**: Đặt thuộc tính `scrub: 1.0` hoặc `1.2` trong GSAP ScrollTrigger và kết hợp với hàm kẹp giá trị `clamp(progress, 0.0, 1.0)`. Không bao giờ để các giá trị nội suy camera vượt ra ngoài dải [0, 1].

#### Q10: Tại sao file âm thanh Web Audio API đôi khi không phát được trên trình duyệt Safari iOS?
- **Giải đáp**: Trình duyệt iOS Safari yêu cầu `AudioContext` phải được kích hoạt bên trong một sự kiện tương tác người dùng trực tiếp (`click` hoặc `touchend`). Hãy tạo hàm khởi tạo `init()` lười (Lazy Init) và kích hoạt nó ở cú chạm màn hình đầu tiên.

#### Q11: Làm thế nào để tạo hiệu ứng kính mờ chân thực trong WebGL mà không bị lag?
- **Giải đáp**: Trong `MeshPhysicalMaterial`, đặt `transmission: 0.92`, `roughness: 0.15`, `ior: 1.5`, và `thickness: 1.2`. Để đạt hiệu năng cao trên mobile, có thể dùng thủ thuật chụp mờ hậu cảnh (Background Blur Pass) và ánh xạ lên bề mặt kính.

#### Q12: Tại sao các đường line `THREE.Line` trên Windows Chrome không thể tăng độ dày `linewidth` lớn hơn 1px?
- **Giải đáp**: Đây là giới hạn cố hữu của trình điều khiển đồ họa OpenGL/ANGLE trên nền tảng Windows. Để tạo đường line dày phát sáng, bắt buộc phải dùng `THREE.TubeGeometry` hoặc thư viện `three-fatline` (`Line2`, `LineGeometry`, `LineMaterial`).

#### Q13: Làm sao để kiểm tra xem một vật thể 3D có nằm trong tầm mắt người dùng trước khi tính toán animation?
- **Giải đáp**: Khởi tạo một đối tượng `THREE.Frustum` và ma trận `THREE.Matrix4`, sau đó gọi `frustum.intersectsObject(mesh)`. Nếu hàm trả về `false`, bạn có thể bỏ qua toàn bộ các tính toán hoạt ảnh phức tạp của vật thể đó trong frame hiện tại.

#### Q14: Có nên dùng thư viện Tailwind CSS chung với WebGL không?
- **Giải đáp**: Rất khuyến khích cho tầng giao diện 2D HUD (Tầng 3)! Tailwind CSS giúp xây dựng bố cục Flexbox, Grid, hiệu ứng kính mờ `backdrop-blur-md` và màu sắc đồng bộ một cách cực kỳ nhanh chóng mà không làm ảnh hưởng đến hiệu năng của canvas 3D bên dưới.

#### Q15: Làm sao để giữ con trỏ chuột Reticle bám chính xác khi người dùng cuộn trang?
- **Giải đáp**: Đặt con trỏ chuột ở chế độ `position: fixed` thay vì `position: absolute`, cập nhật vị trí dựa trên sự kiện `e.clientX` và `e.clientY` (tọa độ viewport) thay vì `e.pageX` và `e.pageY`.

#### Q16: Làm thế nào để nhúng mô hình 3D từ Blender vào trang web mà không để lộ URL tải file?
- **Giải đáp**: Bạn có thể mã hóa file GLB thành chuỗi nhị phân Base64 hoặc nạp file thông qua một API endpoint bảo mật có xác thực Token JWT từ backend FastAPI.

#### Q17: Tại sao vật liệu kim loại vàng hoặc titan trong cảnh 3D bị biến thành màu xám tro?
- **Giải đáp**: Vật liệu kim loại phản xạ 100% ánh sáng của môi trường xung quanh. Nếu trong `scene` không có một bản đồ môi trường (**HDRI Environment Map**) hoặc đèn phản chiếu đủ sáng, kim loại sẽ không có gì để phản chiếu và sẽ bị xám đen.

#### Q18: Kỹ thuật nào giúp tạo mặt nước hoặc hồ chất lỏng kim loại phản chiếu bóng các tòa nhà?
- **Giải đáp**: Sử dụng module `Reflector` chính thức của Three.js (`three/addons/objects/Reflector.js`). Nó tạo một camera ảo đối xứng dưới mặt đất để render ảnh phản chiếu phẳng (Planar Mirror Reflection) hoàn hảo từng pixel.

#### Q19: Làm sao để tối ưu hóa trang web cho các công cụ tìm kiếm (SEO) khi nội dung chính nằm trong 3D?
- **Giải đáp**: Giữ toàn bộ nội dung văn bản quan trọng (tiêu đề H1, mô tả H2, thông số kỹ thuật) trong các thẻ HTML có cấu trúc ngữ nghĩa ngữ pháp chuẩn ở tầng HUD (Tầng 3). Trình thu thập dữ liệu của Google sẽ cào các thẻ HTML này bình thường mà không bị ảnh hưởng bởi canvas 3D.

#### Q20: Lời khuyên quan trọng nhất để đạt giải Awwwards Site of the Day là gì?
- **Giải đáp**: Đừng chỉ làm một cảnh 3D đẹp mắt mà quên mất trải nghiệm người dùng. Tốc độ tải trang dưới 2 giây, sự mượt mà 60FPS không giật lag, âm thanh tương tác tinh tế và câu chuyện truyền tải rõ ràng chính là chìa khóa mở cánh cửa đến các giải thưởng thiết kế quốc tế danh giá nhất!

#### Q21: Làm thế nào để chia sẻ chung tài nguyên WebGL giữa nhiều Canvas khác nhau trên cùng một trang?
- **Giải đáp**: Sử dụng kỹ thuật Scissor Test (`gl.scissor`) của Three.js. Thay vì tạo nhiều `WebGLRenderer` độc lập (gây lãng phí VRAM và quá tải GPU), bạn chỉ tạo đúng 1 Renderer duy nhất chạy ngầm toàn màn hình, sau đó dùng `renderer.setScissor` và `renderer.setViewport` để vẽ từng góc nhìn vào các thẻ `<div>` tương ứng trên trang.

#### Q22: Tại sao độ chính xác `precision highp float` lại quan trọng trong Shaders trên Android?
- **Giải đáp**: Nhiều GPU di động của MediaTek hoặc Mali tự động hạ độ chính xác xuống `mediump` để tiết kiệm pin. Điều này dẫn đến các phép tính ma trận khoảng cách xa bị giật hạt hoặc vỡ hình. Khai báo tường minh `precision highp float;` ở dòng đầu tiên của Vertex và Fragment Shader sẽ ép GPU duy trì độ chính xác 32-bit đầy đủ.

#### Q23: Kỹ thuật nào giúp giảm dung lượng shader code khi đóng gói bản build production?
- **Giải đáp**: Sử dụng plugin Vite/Webpack `vite-plugin-glsl` hoặc `glslify` để tự động loại bỏ các khoảng trắng thừa, xóa chú thích và nén tên biến cục bộ trong file `.glsl`.

#### Q24: Làm sao để mô phỏng sương mù thể tích (Volumetric Fog / Light Shafts) đạt 60FPS?
- **Giải đáp**: Thay vì dùng Raymarching thể tích nặng nề trong Fragment Shader, hãy sử dụng kỹ thuật đặt các mặt phẳng bán trong suốt xếp lớp nối tiếp nhau (`Alpha Blended Billboard Planes`) vuông góc với hướng chiếu của ánh sáng hoặc dùng hạt sương mù GPU Instanced.

#### Q25: Làm cách nào để đồng bộ chuyển động 3D theo nhạc (Beat Sync)?
- **Giải đáp**: Kết nối `AudioContext` với `AnalyserNode`, phân tích năng lượng dải tần số thấp (Sub-bass: 20Hz - 80Hz) trong mỗi khung hình. Khi năng lượng vượt ngưỡng đỉnh (Peak Threshold), kích hoạt hàm GSAP tween giật nhẹ camera hoặc phóng to quầng sáng Bloom của tòa tháp.

#### Q26: Làm sao để kiểm tra rò rỉ bộ nhớ (Memory Leak) trong các ứng dụng WebGL?
- **Giải đáp**: Mở Chrome DevTools -> tab **Memory** -> chụp **Heap Snapshot**. Kiểm tra số lượng đối tượng `WebGLBuffer`, `WebGLTexture` và `THREE.Mesh`. Nếu sau khi chuyển đổi qua lại giữa các trang mà số lượng này tiếp tục tăng dần đều thì mã nguồn đang bị rò rỉ do thiếu hàm `dispose()`.

#### Q27: Tại sao bóng đổ PCFSoftShadowMap đôi khi vẫn bị gãy cạnh trên bề mặt phẳng lớn?
- **Giải đáp**: Do góc chiếu của ánh sáng quá nghiêng (Grazing Angle). Hãy tăng nhẹ bán kính lọc bóng `directionalLight.shadow.radius = 3.0` và thêm một lượng rất nhỏ `normalBias = 0.02` để các tia pháp tuyến không bị triệt tiêu.

#### Q28: Làm thế nào để tạo hiệu ứng hào quang chuyển màu đa sắc (Prismatic Iridescence)?
- **Giải đáp**: Trong `MeshPhysicalMaterial`, kích hoạt các thuộc tính: `iridescence: 1.0`, `iridescenceIOR: 1.3`, `iridescenceThicknessRange: [100, 400]`. Bề mặt sẽ tự động tán sắc ánh sáng giống như vệt dầu loang hoặc váng xà phòng.

#### Q29: Làm sao để người dùng dùng phím bấm (WASD / Mũi tên) để lái camera bay tự do trong thành phố?
- **Giải đáp**: Lắng nghe sự kiện `keydown` và `keyup`, tạo một véc-tơ vận tốc `velocity`. Trong render loop, cộng dồn véc-tơ di chuyển vào vị trí camera theo hướng nhìn `camera.getWorldDirection(dir)`. Áp dụng hệ số cản ma sát `velocity.multiplyScalar(0.92)` để tạo cảm giác trôi mượt.

#### Q30: Tương lai của Web 3D với công nghệ WebGPU là gì?
- **Giải đáp**: WebGPU mang lại khả năng truy cập phần cứng cấp thấp tương tự Vulkan/Metal/DirectX 12, cho phép chạy Compute Shaders trực tiếp trên web với tốc độ gấp 3-5 lần WebGL, mở ra kỷ nguyên mô phỏng vật lý hàng triệu hạt và đồ họa thực tế quang học (Real-time Raytracing) ngay trên trình duyệt mà không cần cài đặt phần mềm.
