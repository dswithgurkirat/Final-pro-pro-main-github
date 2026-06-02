package com.iitropar.dsr.controller;
import com.iitropar.dsr.entity.Report;
import com.iitropar.dsr.entity.ReportStatus;
import com.iitropar.dsr.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired ReportService service;

    @PostMapping
    @PreAuthorize("hasRole('DATA_ENTRY')")
    public ResponseEntity<?> createReport(@RequestBody Report report) {
        return ResponseEntity.ok(service.createReport(report));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAllReports());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam ReportStatus status) {
        return ResponseEntity.ok(service.updateReportStatus(id, status));
    }
}
