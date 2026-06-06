package com.iitropar.dsr.config;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    private static final Logger log = LoggerFactory.getLogger(MinioConfig.class);

    @Value("${minio.url}") private String url;
    @Value("${minio.accessKey}") private String accessKey;
    @Value("${minio.secretKey}") private String secretKey;
    @Value("${minio.bucketName}") private String bucketName;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    @PostConstruct
    public void initBucket() {
        try {
            MinioClient client = MinioClient.builder()
                    .endpoint(url)
                    .credentials(accessKey, secretKey)
                    .build();
            boolean exists = client.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                client.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Created MinIO bucket: {}", bucketName);
            } else {
                log.info("MinIO bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to initialize MinIO bucket '{}': {}", bucketName, e.getMessage());
        }
    }
}
