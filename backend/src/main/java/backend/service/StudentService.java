package backend.service;

import backend.dto.response.StudentResponse;
import backend.model.Student;
import backend.model.User;
import backend.repository.StudentRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private backend.repository.CourseRepository courseRepository;

    // Enroll in a Course
    public void enrollInCourse(String username, Long courseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        backend.model.Student student = studentRepository.findByUser(user)
                .orElseGet(() -> {
                    if ("ACTIVE".equals(user.getStatus())) {
                        backend.model.Student newStudent = new backend.model.Student();
                        newStudent.setFirstName(user.getUsername());
                        newStudent.setLastName("(Not Provided)");
                        newStudent.setEmail(user.getEmail());
                        newStudent.setPhone("N/A");
                        newStudent.setUser(user);
                        return studentRepository.save(newStudent);
                    }
                    throw new RuntimeException("Student profile not found for user: " + username);
                });
                
        backend.model.Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
                
        student.getEnrolledCourses().add(course);
        studentRepository.save(student);
    }
    
    // Get My Courses
    public java.util.Set<backend.model.Course> getMyCourses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
        backend.model.Student student = studentRepository.findByUser(user).orElse(null);
        
        if (student == null || student.getEnrolledCourses() == null) {
            return java.util.Collections.emptySet();
        }
                
        return student.getEnrolledCourses();
    }

    // JWT Token, Logged-in User , auto-link & Profile create
    public StudentResponse createStudentProfile(Student student, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // Email එක කලින් අරන් තියෙනවාද බලනවා (DB Query efficiency)
        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            throw new RuntimeException("Student email is already in use!");
        }

        student.setUser(user); // complete user object , auto-link 
        Student savedStudent = studentRepository.save(student);

        return mapToStudentResponse(savedStudent);
    }


public List<StudentResponse> getAllStudents() {
    return userRepository.findAll().stream()
            .filter(u -> "STUDENT".equals(u.getRole()) && "ACTIVE".equals(u.getStatus()))
            .map(u -> {
                Optional<Student> studentProfile = studentRepository.findByUser(u);
                if (studentProfile.isPresent()) {
                    return mapToStudentResponse(studentProfile.get());
                } else {
                    return new StudentResponse(
                        u.getId(),
                        null,
                        null,
                        u.getEmail(),
                        "N/A",
                        u.getUsername(),
                        u.getStatus()
                    );
                }
            })
            .collect(Collectors.toList());
}


    public Optional<StudentResponse> getStudentById(Long id) {
        return studentRepository.findById(id).map(this::mapToStudentResponse);
    }

    // Logged-in User only see Profile 
    public Optional<StudentResponse> getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Optional<Student> studentProfile = studentRepository.findByUser(user);
        if (studentProfile.isPresent()) {
            return Optional.of(mapToStudentResponse(studentProfile.get()));
        } else {
            // Auto-create Student profile if it's missing and status is ACTIVE
            if ("ACTIVE".equals(user.getStatus())) {
                Student newStudent = new Student();
                newStudent.setFirstName(user.getUsername());
                newStudent.setLastName("(Not Provided)");
                newStudent.setEmail(user.getEmail());
                newStudent.setPhone("N/A");
                newStudent.setUser(user);
                studentRepository.save(newStudent);
                return Optional.of(mapToStudentResponse(newStudent));
            }
            
            return Optional.of(new StudentResponse(
                user.getId(),
                null,
                null,
                user.getEmail(),
                "N/A",
                user.getUsername(),
                user.getStatus()
            ));
        }
    }

    public Optional<StudentResponse> updateStudent(Long id, Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            student.setPhone(studentDetails.getPhone());

            Student updatedStudent = studentRepository.save(student);
            return mapToStudentResponse(updatedStudent);
        });
    }

    public StudentResponse updateMyProfile(String username, Student studentDetails) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + username));

        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        
        if (studentDetails.getPhone() != null) {
            student.setPhone(studentDetails.getPhone());
        }

        Student updatedStudent = studentRepository.save(student);
        return mapToStudentResponse(updatedStudent);
    }


    public boolean deleteStudent(Long id) {
        // Try deleting by Student ID first (if a profile exists)
        Optional<Student> student = studentRepository.findById(id);
        if (student.isPresent()) {
            User user = student.get().getUser();
            studentRepository.delete(student.get());
            if (user != null) {
                userRepository.delete(user);
            }
            return true;
        }

        // If not found, it might be a User ID (for pending profiles without a Student record yet)
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent() && "STUDENT".equals(user.get().getRole())) {
            userRepository.delete(user.get());
            return true;
        }

        return false;
    }

    // DTO Mapper Helper Method (Clean Code)
    private StudentResponse mapToStudentResponse(Student student) {
        String username = (student.getUser() != null) ? student.getUser().getUsername() : null;
        String status = (student.getUser() != null) ? student.getUser().getStatus() : null;
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhone(),
                username,
                status
        );
    }
}