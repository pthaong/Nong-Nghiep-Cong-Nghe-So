package com.smartagriculture.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SeasonRequest {

    @NotBlank(message = "Tên mùa vụ không được để trống")
    private String name;

    @NotBlank(message = "Tên cây trồng không được để trống")
    private String crop;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.01", message = "Diện tích phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2,
            message = "Diện tích tối đa 10 chữ số và 2 chữ số thập phân")
    private BigDecimal area;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate start;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate end;

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(
        regexp = "Lên kế hoạch|Đang canh tác|Đã kết thúc",
        message = "Trạng thái mùa vụ không hợp lệ"
    )
    private String status;

    @AssertTrue(message = "Ngày kết thúc không được trước ngày bắt đầu")
    public boolean isValidDateRange() {
        return start == null || end == null || !end.isBefore(start);
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public BigDecimal getArea() { return area; }
    public void setArea(BigDecimal area) { this.area = area; }

    public LocalDate getStart() { return start; }
    public void setStart(LocalDate start) { this.start = start; }

    public LocalDate getEnd() { return end; }
    public void setEnd(LocalDate end) { this.end = end; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}