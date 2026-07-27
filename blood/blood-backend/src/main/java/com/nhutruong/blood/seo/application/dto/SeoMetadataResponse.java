package com.nhutruong.blood.seo.application.dto;

import java.util.Map;

public record SeoMetadataResponse(
        String title,
        String description,
        String canonicalUrl,
        Map<String, String> openGraph,
        Map<String, Object> structuredData
) {
}
