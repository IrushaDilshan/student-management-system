package backend.controller;

import backend.dto.request.LoginRequest;
import backend.dto.request.StudentSignupRequest;
import backend.dto.response.JwtResponse;
import backend.dto.response.UserResponse;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Student Self-Registration API
    @PostMapping("/student/signup")
    public ResponseEntity<?> registerStudent(@RequestBody StudentSignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // 🔐 Password එක BCrypt වලින් Encrypt කරලා Save කිරීම
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user.setRole("STUDENT");
        user.setStatus("PENDING");

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            savedUser.getStatus()
        );

        return ResponseEntity.ok(response);
    }

    // Admin Pending List
    @GetMapping("/admin/pending-students")
    public List<User> getPendingStudents() {
        return userRepository.findByStatus("PENDING");
    }

    // Admin Approve/Reject
    @PutMapping("/admin/approve-student/{id}")
    public ResponseEntity<?> approveStudent(@PathVariable Long id, @RequestParam String status) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getRole().equals("STUDENT") && (status.equals("ACTIVE") || status.equals("REJECTED"))) {
                user.setStatus(status);
                userRepository.save(user);
                return ResponseEntity.ok("Student status updated to: " + status);
            }
            return ResponseEntity.badRequest().body("Invalid operation or status!");
        }
        return ResponseEntity.notFound().build();
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid username or password!");
        }

        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.badRequest().body("Error: Account is pending admin approval!");
        }

        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(new JwtResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        ));
    }
}