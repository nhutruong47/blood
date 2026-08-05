package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    public static final String USER_CACHE_NAME = "users";

    private final UserRepository userRepository;

    /**
     * Lookup is cached so authenticated requests do not hit the database on
     * every API call. Cache is invalidated by the {@link #evictUser} method on
     * profile updates, password changes and role changes.
     */
    @Override
    @Cacheable(value = USER_CACHE_NAME, key = "#username", unless = "#result == null")
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @CacheEvict(value = USER_CACHE_NAME, key = "#username")
    public void evictUser(String username) {
        // Annotation-driven cache eviction; method body intentionally empty.
    }
}
