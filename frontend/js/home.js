<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgriSmart - Trang chủ</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/home.css">
</head>

<body>
    <header class="home-header">
        <div class="header-left">
            <h1>Trang chủ</h1>
            <p>Tổng quan canh tác hôm nay</p>
            <p id="userGreeting" class="user-greeting">Xin chào, Nông dân!</p>
        </div>

        <div class="header-right">
            <button class="theme-button" type="button" title="Giao diện">
                <i class="bi bi-sun"></i>
            </button>

            <a href="notification.html" class="notification-button" title="Thông báo">
                <i class="bi bi-bell"></i>
                <span id="homeNotificationBadge" class="notification-badge">0</span>
            </a>

            <span class="farmer-badge">Nông dân</span>

            <a href="profile.html" class="profile-button" title="Hồ sơ cá nhân">
                <i class="bi bi-person-circle"></i>
            </a>
        </div>
    </header>

    <main class="home-container">
        <section class="module-navigation">
            <div class="module-grid">
                <a class="module-card" href="seasons.html">
                    <div class="module-icon green"><i class="bi bi-calendar3-range"></i></div>
                    <div class="module-info">
                        <strong>Mùa vụ</strong>
                        <span>Quản lý vụ canh tác</span>
                    </div>
                </a>

                <a class="module-card" href="diary.html">
                    <div class="module-icon blue"><i class="bi bi-journal-text"></i></div>
                    <div class="module-info">
                        <strong>Nhật ký canh tác</strong>
                        <span>Ghi nhận công việc</span>
                    </div>
                </a>

                <a class="module-card" href="weather.html">
                    <div class="module-icon sky"><i class="bi bi-cloud-sun"></i></div>
                    <div class="module-info">
                        <strong>Thời tiết</strong>
                        <span>Dự báo theo khu vực</span>
                    </div>
                </a>

                <a class="module-card" href="ai.html">
                    <div class="module-icon purple"><i class="bi bi-robot"></i></div>
                    <div class="module-info">
                        <strong>AI chẩn đoán</strong>
                        <span>Tư vấn bệnh cây</span>
                    </div>
                </a>

                <a class="module-card" href="knowledge.html">
                    <div class="module-icon orange"><i class="bi bi-book-half"></i></div>
                    <div class="module-info">
                        <strong>Kiến thức nông nghiệp</strong>
                        <span>Tài liệu tham khảo</span>
                    </div>
                </a>

                <a class="module-card" href="profile.html">
                    <div class="module-icon gold"><i class="bi bi-person-vcard"></i></div>
                    <div class="module-info">
                        <strong>Hồ sơ</strong>
                        <span>Thông tin cá nhân</span>
                    </div>
                </a>

                <a class="module-card module-card-alert" href="notification.html">
                    <div class="module-icon red"><i class="bi bi-bell-fill"></i></div>
                    <div class="module-info">
                        <strong>Thông báo</strong>
                        <span>Nhận tin nhắn mới</span>
                    </div>
                    <span id="homeNotificationBadgeInline" class="inline-badge">0</span>
                </a>
            </div>
        </section>

        <section class="top-grid">
            <div class="weather-card">
                <div class="weather-background-circle"></div>
                <div class="weather-content">
                    <div class="weather-location">
                        THỜI TIẾT HÔM NAY ·
                        <strong id="weatherLocation">Cao Bằng</strong>
                    </div>

                    <div class="weather-main">
                        <div>
                            <div class="weather-temperature" id="weatherTemperature">31°C</div>
                            <div class="weather-description" id="weatherDescription">Trời quang nhẹ</div>
                        </div>
                        <div class="weather-symbol">
                            <i class="bi bi-cloud-sun"></i>
                        </div>
                    </div>

                    <div class="weather-details">
                        <div class="weather-detail">
                            <i class="bi bi-droplet"></i>
                            <div>
                                <strong id="humidityValue">68%</strong>
                                <span>Độ ẩm</span>
                            </div>
                        </div>

                        <div class="weather-detail">
                            <i class="bi bi-cloud-rain"></i>
                            <div>
                                <strong id="rainValue">51%</strong>
                                <span>Khả năng mưa</span>
                            </div>
                        </div>

                        <div class="weather-detail">
                            <i class="bi bi-wind"></i>
                            <div>
                                <strong id="windValue">3 km/h</strong>
                                <span>Gió</span>
                            </div>
                        </div>
                    </div>

                    <button class="forecast-button" type="button">
                        Xem dự báo 7 ngày
                        <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="warning-card">
                <div class="card-heading">
                    <h2>
                        <i class="bi bi-exclamation-triangle"></i>
                        Cảnh báo thông minh
                    </h2>
                </div>

                <div class="warning-box">
                    <div class="warning-icon">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div class="warning-content">
                        <h3>Khả năng mưa khá cao</h3>
                        <p>
                            Xác suất mưa cao nhất khoảng 67%. Nên bố trí tưới bón, phân và phun thuốc vào thời điểm khô ráo.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon green"><i class="bi bi-flower1"></i></div>
                <div class="stat-value">3</div>
                <div class="stat-label">Ruộng đang quản lý</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon orange"><i class="bi bi-rulers"></i></div>
                <div class="stat-value">2.3</div>
                <div class="stat-label">Tổng diện tích (ha)</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon blue"><i class="bi bi-journal-check"></i></div>
                <div class="stat-value">4</div>
                <div class="stat-label">Nhật ký tháng này</div>
            </div>

            <div class="stat-card">
                <div class="stat-icon yellow"><i class="bi bi-robot"></i></div>
                <div class="stat-value">4</div>
                <div class="stat-label">Lượt hỏi AI</div>
            </div>
        </section>

        <section class="middle-grid">
            <div class="panel-card">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="bi bi-flower1"></i>
                        <h2>Cây trồng đang quản lý</h2>
                    </div>
                    <button type="button" class="view-all-button">Xem tất cả</button>
                </div>

                <div class="crop-grid">
                    <div class="crop-card">
                        <div class="crop-top">
                            <div>
                                <h3>Ruộng số 1 - Ấp Bình An</h3>
                                <p>Lúa OM5451 · 1.2 ha</p>
                            </div>
                            <span class="crop-badge">Đẻ nhánh</span>
                        </div>

                        <div class="crop-progress">
                            <div class="progress-fill" style="width: 72%;"></div>
                        </div>

                        <div class="crop-info">
                            <span>Gieo trồng: 2026-01-10</span>
                            <span>Vụ Đông Xuân 2026</span>
                        </div>

                        <div class="crop-actions">
                            <button type="button" class="crop-action edit" title="Chỉnh sửa">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="crop-action delete" title="Xóa">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="crop-card">
                        <div class="crop-top">
                            <div>
                                <h3>Vườn cà chua sau nhà</h3>
                                <p>Cà chua · 0.3 ha</p>
                            </div>
                            <span class="crop-badge">Ra hoa</span>
                        </div>

                        <div class="crop-progress">
                            <div class="progress-fill" style="width: 90%;"></div>
                        </div>

                        <div class="crop-info">
                            <span>Gieo trồng: 2026-08-15</span>
                            <span>Vụ Hè Thu 2026</span>
                        </div>

                        <div class="crop-actions">
                            <button type="button" class="crop-action edit" title="Chỉnh sửa">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="crop-action delete" title="Xóa">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="crop-card">
                        <div class="crop-top">
                            <div>
                                <h3>Ruộng số 2 - Kênh 3</h3>
                                <p>Lúa OM18 · 0.8 ha</p>
                            </div>
                            <span class="crop-badge">Mạ non / cây con</span>
                        </div>

                        <div class="crop-progress">
                            <div class="progress-fill" style="width: 28%;"></div>
                        </div>

                        <div class="crop-info">
                            <span>Gieo trồng: 2026-07-01</span>
                        </div>

                        <div class="crop-actions">
                            <button type="button" class="crop-action edit" title="Chỉnh sửa">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="crop-action delete" title="Xóa">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel-card">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="bi bi-cash-coin"></i>
                        <h2>Giá nông sản nổi bật</h2>
                    </div>
                    <button type="button" class="view-all-button">Xem tất cả</button>
                </div>

                <div class="price-list">
                    <div class="price-item">
                        <div>
                            <strong>Lúa OM5451</strong>
                            <span>đ/kg</span>
                        </div>
                        <div class="price-right">
                            <strong>7.800đ</strong>
                            <span class="price-up">↑ 2.3%</span>
                        </div>
                    </div>

                    <div class="price-item">
                        <div>
                            <strong>Cà chua</strong>
                            <span>đ/kg</span>
                        </div>
                        <div class="price-right">
                            <strong>12.500đ</strong>
                            <span class="price-down">↓ 4.1%</span>
                        </div>
                    </div>

                    <div class="price-item">
                        <div>
                            <strong>Xoài cát Hòa Lộc</strong>
                            <span>đ/kg</span>
                        </div>
                        <div class="price-right">
                            <strong>32.000đ</strong>
                            <span class="price-up">↑ 1%</span>
                        </div>
                    </div>

                    <div class="price-item">
                        <div>
                            <strong>Rau muống</strong>
                            <span>đ/kg</span>
                        </div>
                        <div class="price-right">
                            <strong>9.000đ</strong>
                            <span class="price-neutral">− 0%</span>
                        </div>
                    </div>

                    <div class="price-item">
                        <div>
                            <strong>Thanh long</strong>
                            <span>đ/kg</span>
                        </div>
                        <div class="price-right">
                            <strong>18.500đ</strong>
                            <span class="price-down">↓ 2.7%</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="ai-panel">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="bi bi-stars"></i>
                    <h2>Khuyến nghị AI mới nhất</h2>
                </div>
                <a href="ai.html" class="ai-question-button">Hỏi AI ngay</a>
            </div>

            <div class="recommendation-grid">
                <div class="recommendation-card danger">
                    <div class="recommendation-tag">
                        <i class="bi bi-exclamation-circle"></i>
                        Nguy cơ cao
                    </div>
                    <h3>Nguy cơ nấm bệnh cao trên cà chua</h3>
                    <p>
                        Độ ẩm cao kèm mưa liên tục khiến vườn cà chua ở giai đoạn ra hoa có nguy cơ nhiễm sương mai. Nên phun phòng trong 2 ngày tới.
                    </p>
                    <span class="recommendation-time"><i class="bi bi-clock"></i> Hôm nay</span>
                </div>

                <div class="recommendation-card warning">
                    <div class="recommendation-tag">
                        <i class="bi bi-exclamation-triangle"></i>
                        Cần lưu ý
                    </div>
                    <h3>Nên hoãn bón phân do mưa lớn sắp tới</h3>
                    <p>
                        Mưa to 80–120mm dự báo trong 2 ngày tới có thể rửa trôi phân bón trên ruộng lúa OM5451. Khuyến nghị hoãn bón thuốc đến khi tạnh ráo.
                    </p>
                    <span class="recommendation-time"><i class="bi bi-clock"></i> Hôm nay</span>
                </div>

                <div class="recommendation-card info">
                    <div class="recommendation-tag">
                        <i class="bi bi-info-circle"></i>
                        Thông tin
                    </div>
                    <h3>Giai đoạn đẻ nhánh cần giữ mực nước 3–5cm</h3>
                    <p>
                        Ruộng số 1 đang ở giai đoạn đẻ nhánh, nên duy trì mực nước 3–5cm để cây đẻ nhánh khỏe và hạn chế cỏ dại.
                    </p>
                    <span class="recommendation-time"><i class="bi bi-clock"></i> Hôm qua</span>
                </div>
            </div>
        </section>
    </main>

    <script src="../js/home.js"></script>
</body>

</html>
