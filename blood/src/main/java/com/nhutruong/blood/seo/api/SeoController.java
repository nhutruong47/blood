package com.nhutruong.blood.seo.api;

import com.nhutruong.blood.donation.application.DonationLocationService;
import com.nhutruong.blood.donation.domain.DonationLocation;
import com.nhutruong.blood.seo.application.SeoService;
import com.nhutruong.blood.seo.application.dto.SeoMetadataResponse;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
public class SeoController {
    private final SeoService seoService;
    private final DonationLocationService locationService;

    public SeoController(SeoService seoService, DonationLocationService locationService) {
        this.seoService = seoService;
        this.locationService = locationService;
    }

    @GetMapping("/api/public/seo/metadata")
    public ApiResponse<SeoMetadataResponse> homeMetadata(HttpServletRequest request) {
        return ApiResponse.success(seoService.homeMetadata(baseUrl(request)));
    }

    @GetMapping("/api/public/locations/{slug}/seo")
    public ApiResponse<SeoMetadataResponse> locationMetadata(
            @PathVariable String slug,
            HttpServletRequest request
    ) {
        DonationLocation location = locationService.getPublishedBySlug(slug);
        return ApiResponse.success(seoService.locationMetadata(location, baseUrl(request)));
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap(HttpServletRequest request) {
        return seoService.sitemapXml(baseUrl(request));
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots(HttpServletRequest request) {
        return seoService.robotsTxt(baseUrl(request));
    }

    private String baseUrl(HttpServletRequest request) {
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isBlank()) {
            scheme = request.getScheme();
        }

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) {
            host = request.getServerName() + port(request);
        }

        return scheme + "://" + host;
    }

    private String port(HttpServletRequest request) {
        int port = request.getServerPort();
        boolean defaultHttp = request.getScheme().equals("http") && port == 80;
        boolean defaultHttps = request.getScheme().equals("https") && port == 443;
        return defaultHttp || defaultHttps ? "" : ":" + port;
    }
}
