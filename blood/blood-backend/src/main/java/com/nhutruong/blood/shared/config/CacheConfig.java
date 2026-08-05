package com.nhutruong.blood.shared.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserCache;
import org.springframework.security.core.userdetails.cache.SpringCacheBasedUserCache;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String USERS_CACHE = "users";
    public static final String REFERENCE_DATA_CACHE = "referenceData";
    public static final String BLOOD_STOCK_CACHE = "bloodStock";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                REFERENCE_DATA_CACHE, BLOOD_STOCK_CACHE, USERS_CACHE);
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }

    /**
     * Spring Security user cache backed by Caffeine so authenticated requests
     * do not hit the database on every API call. Cache is invalidated on
     * profile updates, password changes and role changes.
     */
    @Bean
    public UserCache userCache(CacheManager cacheManager) {
        return new SpringCacheBasedUserCache(cacheManager.getCache(USERS_CACHE));
    }

    Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats();
    }
}
