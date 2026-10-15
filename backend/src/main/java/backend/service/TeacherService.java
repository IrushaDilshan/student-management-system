package backend.service;

import backend.model.Teacher;
import backend.model.User;
import backend.model.Course;
import backend.repository.TeacherRepository;
import backend.repository.CourseRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import backend.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id " + id));
    }

    public Teacher createTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(Long id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id " + id));

        teacher.setFirstName(teacherDetails.getFirstName());
        teacher.setLastName(teacherDetails.getLastName());
        teacher.setEmail(teacherDetails.getEmail());
        teacher.setPhone(teacherDetails.getPhone());
        teacher.setDepartment(teacherDetails.getDepartment());

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id " + id));

        // 1. Unassign teacher from any courses before deleting
        List<Course> assignedCourses = courseRepository.findByTeacher_Id(id);
        for (Course course : assignedCourses) {
            course.setTeacher(null);
            courseRepository.save(course);
        }

        // 2. Capture associated user
        User user = teacher.getUser();

        // 3. Delete teacher profile
        teacherRepository.delete(teacher);

        // 4. Delete user account so username/email can be reused
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
