package backend.controller;

import backend.dto.response.StudentResponse;
import backend.model.Student;
import backend.service.StudentService;
import backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // Get All Students
@GetMapping
public List<StudentResponse> getAllStudents() {
    return studentService.getAllStudents();
}

    // Get Student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
        return ResponseEntity.ok(student);
    }

    // 🔐 Logged-in User ගේ My Profile එක ගන්න (GET /api/students/me)
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String username = authentication.getName();
        StudentResponse profile = studentService.getMyProfile(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + username));
        return ResponseEntity.ok(profile);
    }

    // 🔐 Add Student Profile (JWT Token එකෙන් Logged-in User ව Auto Select කර ගනී)
    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody Student student, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized: Please log in first.");
        }

        try {
            String username = authentication.getName(); // JWT Token එකෙන් Username එක අරගන්නවා
            StudentResponse savedStudent = studentService.createStudentProfile(student, username);
            return ResponseEntity.ok(savedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update Student Profile
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id, @Valid @RequestBody Student studentDetails) {
        StudentResponse updatedStudent = studentService.updateStudent(id, studentDetails)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
        return ResponseEntity.ok(updatedStudent);
    }

    // Delete Student
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        if (studentService.deleteStudent(id)) {
            return ResponseEntity.ok().build();
        }
        throw new ResourceNotFoundException("Student not found with id " + id);
    }
}