package backend.repository;

import backend.model.Student;
import backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByEmail(String email);
    java.util.List<Student> findByEnrolledCourses_Id(Long courseId);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM Student s JOIN s.enrolledCourses c WHERE c.teacher.id = :teacherId")
    java.util.List<Student> findDistinctByTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
}