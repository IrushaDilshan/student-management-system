package backend.controller;

import backend.model.Course;
import backend.model.Student;
import backend.model.Teacher;
import backend.repository.CourseRepository;
import backend.repository.StudentRepository;
import backend.repository.TeacherRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/dashboard")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherDashboardController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Teacher getCurrentTeacher() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return teacherRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for user: " + username));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses() {
        Teacher teacher = getCurrentTeacher();
        List<Course> courses = courseRepository.findByTeacher_Id(teacher.getId());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<Student>> getStudentsInCourse(@PathVariable Long courseId) {
        Teacher teacher = getCurrentTeacher();
        
        // Verify course belongs to teacher
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
                
        if (course.getTeacher() == null || !course.getTeacher().getId().equals(teacher.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        List<Student> students = studentRepository.findByEnrolledCourses_Id(courseId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllMyStudents() {
        Teacher teacher = getCurrentTeacher();
        List<Student> students = studentRepository.findDistinctByTeacherId(teacher.getId());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/profile")
    public ResponseEntity<Teacher> getMyProfile() {
        return ResponseEntity.ok(getCurrentTeacher());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> updates) {
        Teacher teacher = getCurrentTeacher();
        
        if (updates.containsKey("firstName")) {
            teacher.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            teacher.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("department")) {
            teacher.setDepartment(updates.get("department"));
        }
        if (updates.containsKey("phone")) {
            teacher.setPhone(updates.get("phone"));
        }
        
        if (updates.containsKey("newPassword") && !updates.get("newPassword").trim().isEmpty()) {
            backend.model.User user = teacher.getUser();
            user.setPassword(passwordEncoder.encode(updates.get("newPassword")));
            userRepository.save(user);
        }
        
        teacherRepository.save(teacher);
        return ResponseEntity.ok(teacher);
    }
}
