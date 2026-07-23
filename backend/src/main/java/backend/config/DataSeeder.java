package backend.config;

import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Get or create admin
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername("admin");
            newUser.setEmail("admin@example.com");
            newUser.setRole("ADMIN");
            newUser.setStatus("ACTIVE");
            return newUser;
        });

        // Always reset the password to ensure it is properly BCrypt encoded
        // in case it was created manually in Supabase as plain text!
        admin.setPassword(passwordEncoder.encode("admin123"));
        
        userRepository.save(admin);
        System.out.println("✅ Admin user seeded/updated successfully! (Username: admin, Password: admin123)");
    }
}
