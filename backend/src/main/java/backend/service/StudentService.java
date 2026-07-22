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
    return studentRepository.findAll().stream()
            .map(this::mapToStudentResponse)
            .collect(Collectors.toList());
}


    public Optional<StudentResponse> getStudentById(Long id) {
        return studentRepository.findById(id).map(this::mapToStudentResponse);
    }

    // Logged-in User only see Profile 
    public Optional<StudentResponse> getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        return studentRepository.findByUser(user).map(this::mapToStudentResponse);
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

    public boolean deleteStudent(Long id) {
        return studentRepository.findById(id).map(student -> {
            studentRepository.delete(student);
            return true;
        }).orElse(false);
    }

    // DTO Mapper Helper Method (Clean Code)
    private StudentResponse mapToStudentResponse(Student student) {
        String username = (student.getUser() != null) ? student.getUser().getUsername() : null;
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhone(),
                username
        );
    }
}