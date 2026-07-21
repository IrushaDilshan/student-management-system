package backend.controller;

import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // Admin add Teacher 
    @PostMapping("/add-teacher")
    public ResponseEntity<?> addTeacher(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }
        user.setRole("TEACHER"); 
        user.setStatus("ACTIVE"); 
        User savedTeacher = userRepository.save(user);
        return ResponseEntity.ok("Teacher added successfully with ACTIVE status!");
    }
}