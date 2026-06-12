package com.dataquest.domain.valueobject;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailTest {

    @Test
    void testValidEmail() {
        Email email = new Email("test@example.com");
        assertEquals("test@example.com", email.getValue());
    }

    @Test
    void testEmailIsLowercased() {
        Email email = new Email("Test@Example.Com");
        assertEquals("test@example.com", email.getValue());
    }

    @Test
    void testInvalidEmailThrows() {
        assertThrows(IllegalArgumentException.class, () -> new Email("not-an-email"));
    }

    @Test
    void testNullEmailThrows() {
        assertThrows(IllegalArgumentException.class, () -> new Email(null));
    }

    @Test
    void testEmailEquality() {
        assertEquals(new Email("a@b.com"), new Email("A@B.COM"));
    }
}
