package backend.controller;

import backend.dto.response.StudentResponse;
import backend.model.Student;
import backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // Get All Students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

// Get Student by ID (Clean DTO Output)
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            String username = (student.getUser() != null) ? student.getUser().getUsername() : null;
            StudentResponse response = new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhone(),
                username
            );
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

// Add Student Profile
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        if (studentRepository.findAll().stream().anyMatch(s -> s.getEmail().equals(student.getEmail()))) {
            return ResponseEntity.badRequest().body("Student email is already in use!");
        }
        Student savedStudent = studentRepository.save(student);
        return ResponseEntity.ok(savedStudent);
    }

// Update Student Profile (Clean Response)
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            student.setPhone(studentDetails.getPhone());
            
            Student updatedStudent = studentRepository.save(student);
            String username = (updatedStudent.getUser() != null) ? updatedStudent.getUser().getUsername() : null;

            StudentResponse response = new StudentResponse(
                updatedStudent.getId(),
                updatedStudent.getFirstName(),
                updatedStudent.getLastName(),
                updatedStudent.getEmail(),
                updatedStudent.getPhone(),
                username
            );
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete Student
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            studentRepository.delete(student);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}