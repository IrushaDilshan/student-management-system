package backend.controller;

import backend.model.Teacher;
import backend.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    // Get All Teachers (Admin / System Management)
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // Get Teacher by ID
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create Teacher Profile
    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    // Update Teacher Profile
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setFirstName(teacherDetails.getFirstName());
            teacher.setLastName(teacherDetails.getLastName());
            teacher.setEmail(teacherDetails.getEmail());
            teacher.setPhone(teacherDetails.getPhone());
            teacher.setDepartment(teacherDetails.getDepartment());
            return ResponseEntity.ok(teacherRepository.save(teacher));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete Teacher Profile
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        return teacherRepository.findById(id).map(teacher -> {
            teacherRepository.delete(teacher);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}