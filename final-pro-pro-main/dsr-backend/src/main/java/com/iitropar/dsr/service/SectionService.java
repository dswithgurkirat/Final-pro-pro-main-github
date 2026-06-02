package com.iitropar.dsr.service;

import com.iitropar.dsr.entity.*;
import com.iitropar.dsr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;

    public Section updateStatus(Long sectionId, SectionStatus newStatus, User actor) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        
        section.setStatus(newStatus);
        sectionRepository.save(section);
        
        AuditLog log = AuditLog.builder()
                .action("STATUS_CHANGED_TO_" + newStatus.name())
                .entityType("SECTION")
                .entityId(section.getId())
                .actor(actor)
                .build();
        auditLogRepository.save(log);
        
        return section;
    }

    public Section saveDraft(Long sectionId, String content, User actor) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        
        section.setContent(content);
        section.setStatus(SectionStatus.DRAFT_SAVED);
        return sectionRepository.save(section);
    }
    
    public Comment addComment(Long sectionId, String text, User reviewer) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        
        Comment comment = Comment.builder()
                .commentText(text)
                .section(section)
                .author(reviewer)
                .build();
        
        return commentRepository.save(comment);
    }
}
