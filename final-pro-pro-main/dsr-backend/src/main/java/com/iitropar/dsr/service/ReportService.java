package com.iitropar.dsr.service;
import com.iitropar.dsr.entity.Report;
import com.iitropar.dsr.entity.ReportStatus;
import com.iitropar.dsr.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReportService {
    @Autowired private ReportRepository reportRepository;

    public Report createReport(Report report) {
        report.setStatus(ReportStatus.DRAFT);
        return reportRepository.save(report);
    }
    public List<Report> getAllReports() { return reportRepository.findAll(); }
    public Report getReport(Long id) { return reportRepository.findById(id).orElseThrow(); }
    public Report updateReportStatus(Long id, ReportStatus status) {
        Report report = getReport(id);
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
