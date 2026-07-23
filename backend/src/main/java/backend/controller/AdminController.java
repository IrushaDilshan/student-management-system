package backend.controller;

import backend.model.User;
import backend.model.Teacher;
import backend.dto.request.TeacherSignupRequest;
import backend.repository.UserRepository;
import backend.repository.TeacherRepository;
import backend.repository.StudentRepository;
import backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Admin add Teacher (Creates both User and Teacher profile)
    @PostMapping("/teachers")
    public ResponseEntity<?> addTeacher(@Valid @RequestBody TeacherSignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email address is already registered!");
        }

        // Create User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("TEACHER"); 
        user.setStatus("ACTIVE"); 
        User savedUser = userRepository.save(user);
        
        // Create Teacher Profile
        Teacher teacher = new Teacher();
        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());
        teacher.setPhone(request.getPhone());
        teacher.setDepartment(request.getDepartment());
        teacher.setUser(savedUser);
        teacherRepository.save(teacher);

        return ResponseEntity.ok("Teacher created successfully!");
    }
    
    // Dashboard Stats Endpoint
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        long totalStudents = userRepository.countByRoleAndStatus("STUDENT", "ACTIVE");
        long pendingApprovals = userRepository.countByRoleAndStatus("STUDENT", "PENDING");
        long totalTeachers = userRepository.countByRole("TEACHER");
        long totalCourses = courseRepository.count();
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalCourses", totalCourses);
        
        return ResponseEntity.ok(stats);
    }
}