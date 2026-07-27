package com.nhutruong.blood.seo.application;

import com.nhutruong.blood.donation.domain.DonationLocation;
import com.nhutruong.blood.donation.infrastructure.DonationLocationRepository;
import com.nhutruong.blood.seo.application.dto.SeoMetadataResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SeoService {
    private final DonationLocationRepository locationRepository;

    public SeoService(DonationLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public SeoMetadataResponse homeMetadata(String baseUrl) {
        String canonical = baseUrl + "/";
        String title = "Blood Donation Management";
        String description = "Find donation locations, schedules, and blood request workflows.";
        return new SeoMetadataResponse(
                title,
                description,
                canonical,
                openGraph(title, description, canonical, "website"),
                organizationStructuredData(baseUrl)
        );
    }

    @Transactional(readOnly = true)
    public SeoMetadataResponse locationMetadata(DonationLocation location, String baseUrl) {
        String canonical = baseUrl + "/locations/" + location.getSlug();
        String title = location.getSeoTitle();
        String description = location.getSeoDescription();
        Map<String, Object> structuredData = new LinkedHashMap<>();
        structuredData.put("@context", "https://schema.org");
        structuredData.put("@type", "MedicalOrganization");
        structuredData.put("name", location.getName());
        structuredData.put("address", location.getAddress());
        structuredData.put("url", canonical);
        if (location.getLatitude() != null && location.getLongitude() != null) {
            Map<String, Object> geo = new LinkedHashMap<>();
            geo.put("@type", "GeoCoordinates");
            geo.put("latitude", location.getLatitude());
            geo.put("longitude", location.getLongitude());
            structuredData.put("geo", geo);
        }

        return new SeoMetadataResponse(
                title,
                description,
                canonical,
                openGraph(title, description, canonical, "place"),
                structuredData
        );
    }

    @Transactional(readOnly = true)
    public String sitemapXml(String baseUrl) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        appendUrl(xml, baseUrl + "/", "daily", "0.8");
        appendUrl(xml, baseUrl + "/locations", "daily", "0.7");

        List<DonationLocation> locations = locationRepository.findByPublishedTrue();
        for (DonationLocation location : locations) {
            appendUrl(xml, baseUrl + "/locations/" + location.getSlug(), "weekly", "0.6");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    public String robotsTxt(String baseUrl) {
        return "User-agent: *\n"
                + "Allow: /\n"
                + "Sitemap: " + baseUrl + "/sitemap.xml\n";
    }

    private Map<String, String> openGraph(String title, String description, String url, String type) {
        Map<String, String> openGraph = new LinkedHashMap<>();
        openGraph.put("og:title", title);
        openGraph.put("og:description", description);
        openGraph.put("og:url", url);
        openGraph.put("og:type", type);
        return openGraph;
    }

    private Map<String, Object> organizationStructuredData(String baseUrl) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("@context", "https://schema.org");
        data.put("@type", "Organization");
        data.put("name", "Blood Donation Management");
        data.put("url", baseUrl);
        return data;
    }

    private void appendUrl(StringBuilder xml, String loc, String changefreq, String priority) {
        xml.append("<url>");
        xml.append("<loc>").append(escapeXml(loc)).append("</loc>");
        xml.append("<changefreq>").append(changefreq).append("</changefreq>");
        xml.append("<priority>").append(priority).append("</priority>");
        xml.append("</url>");
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
