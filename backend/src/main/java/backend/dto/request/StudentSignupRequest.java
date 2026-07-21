package backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentSignupRequest {
    private String username;
    private String email;
    private String password;
}