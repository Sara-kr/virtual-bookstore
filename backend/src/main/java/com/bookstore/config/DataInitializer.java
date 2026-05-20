package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.enums.RoleType;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);


    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initAdminUser();
        initSampleBooks();
        log.info("Data initialization complete");
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name(RoleType.ROLE_USER).build());
            roleRepository.save(Role.builder().name(RoleType.ROLE_ADMIN).build());
            log.info("Roles initialized");
        }
    }

    private void initAdminUser() {
        if (!userRepository.existsByEmail("admin@bookstore.com")) {
            Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow();
            Role userRole = roleRepository.findByName(RoleType.ROLE_USER).orElseThrow();

            User admin = User.builder()
                .username("admin")
                .email("admin@bookstore.com")
                .password(passwordEncoder.encode("Admin@1234"))
                .firstName("Admin")
                .lastName("User")
                .roles(new HashSet<>(Set.of(adminRole, userRole)))
                .isActive(true)
                .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@bookstore.com / Admin@1234");
        }

        if (!userRepository.existsByEmail("user@bookstore.com")) {
            Role userRole = roleRepository.findByName(RoleType.ROLE_USER).orElseThrow();
            User testUser = User.builder()
                .username("testuser")
                .email("user@bookstore.com")
                .password(passwordEncoder.encode("User@1234"))
                .firstName("Test")
                .lastName("User")
                .roles(new HashSet<>(Set.of(userRole)))
                .isActive(true)
                .build();
            userRepository.save(testUser);
            log.info("Test user created: user@bookstore.com / User@1234");
        }
    }

    private void initSampleBooks() {
        if (bookRepository.count() == 0) {
            List<Book> books = List.of(
                Book.builder().title("Clean Code").author("Robert C. Martin")
                    .category("Programming").price(new BigDecimal("39.99")).stock(50)
                    .rating(4.8).reviewCount(1250)
                    .description("A handbook of agile software craftsmanship. Every programmer should read this book.")
                    .imageUrl("https://covers.openlibrary.org/b/id/8739161-L.jpg")
                    .publishedDate(LocalDate.of(2008, 8, 1)).isbn("9780132350884")
                    .publisher("Prentice Hall").pageCount(431).language("English").build(),

                Book.builder().title("The Pragmatic Programmer").author("David Thomas")
                    .category("Programming").price(new BigDecimal("44.99")).stock(35)
                    .rating(4.7).reviewCount(980)
                    .description("Your journey to mastery. Cuts through the increasing specialization of software development.")
                    .imageUrl("https://covers.openlibrary.org/b/id/8091964-L.jpg")
                    .publishedDate(LocalDate.of(2019, 9, 23)).isbn("9780135957059")
                    .publisher("Addison-Wesley").pageCount(352).language("English").build(),

                Book.builder().title("Design Patterns").author("Gang of Four")
                    .category("Programming").price(new BigDecimal("49.99")).stock(28)
                    .rating(4.6).reviewCount(820)
                    .description("Elements of Reusable Object-Oriented Software. The classic reference for design patterns.")
                    .imageUrl("https://covers.openlibrary.org/b/id/6425920-L.jpg")
                    .publishedDate(LocalDate.of(1994, 10, 31)).isbn("9780201633610")
                    .publisher("Addison-Wesley").pageCount(395).language("English").build(),

                Book.builder().title("Atomic Habits").author("James Clear")
                    .category("Self-Help").price(new BigDecimal("18.99")).stock(120)
                    .rating(4.9).reviewCount(4500)
                    .description("An easy and proven way to build good habits and break bad ones.")
                    .imageUrl("https://covers.openlibrary.org/b/id/10521270-L.jpg")
                    .publishedDate(LocalDate.of(2018, 10, 16)).isbn("9780735211292")
                    .publisher("Avery").pageCount(320).language("English").build(),

                Book.builder().title("The Great Gatsby").author("F. Scott Fitzgerald")
                    .category("Fiction").price(new BigDecimal("12.99")).stock(75)
                    .rating(4.2).reviewCount(3200)
                    .description("A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.")
                    .imageUrl("https://covers.openlibrary.org/b/id/8432819-L.jpg")
                    .publishedDate(LocalDate.of(1925, 4, 10)).isbn("9780743273565")
                    .publisher("Scribner").pageCount(180).language("English").build(),

                Book.builder().title("Dune").author("Frank Herbert")
                    .category("Science Fiction").price(new BigDecimal("16.99")).stock(60)
                    .rating(4.7).reviewCount(2800)
                    .description("Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.")
                    .imageUrl("https://covers.openlibrary.org/b/id/7898938-L.jpg")
                    .publishedDate(LocalDate.of(1965, 8, 1)).isbn("9780441013593")
                    .publisher("Ace Books").pageCount(896).language("English").build(),

                Book.builder().title("Introduction to Algorithms").author("Thomas H. Cormen")
                    .category("Computer Science").price(new BigDecimal("89.99")).stock(20)
                    .rating(4.5).reviewCount(640)
                    .description("The essential reference for computer science students and professionals.")
                    .imageUrl("https://covers.openlibrary.org/b/id/8739250-L.jpg")
                    .publishedDate(LocalDate.of(2009, 7, 31)).isbn("9780262033848")
                    .publisher("MIT Press").pageCount(1292).language("English").build(),

                Book.builder().title("Sapiens").author("Yuval Noah Harari")
                    .category("History").price(new BigDecimal("22.99")).stock(85)
                    .rating(4.6).reviewCount(5100)
                    .description("A brief history of humankind from the Stone Age to the modern era.")
                    .imageUrl("https://covers.openlibrary.org/b/id/10121323-L.jpg")
                    .publishedDate(LocalDate.of(2015, 2, 10)).isbn("9780062316097")
                    .publisher("Harper").pageCount(443).language("English").build(),

                Book.builder().title("System Design Interview").author("Alex Xu")
                    .category("Programming").price(new BigDecimal("35.99")).stock(42)
                    .rating(4.7).reviewCount(890)
                    .description("An insider's guide to system design interviews at top tech companies.")
                    .imageUrl("https://covers.openlibrary.org/b/id/10806869-L.jpg")
                    .publishedDate(LocalDate.of(2020, 6, 12)).isbn("9798664653403")
                    .publisher("Independently Published").pageCount(309).language("English").build(),

                Book.builder().title("Deep Work").author("Cal Newport")
                    .category("Self-Help").price(new BigDecimal("17.99")).stock(95)
                    .rating(4.5).reviewCount(2100)
                    .description("Rules for focused success in a distracted world.")
                    .imageUrl("https://covers.openlibrary.org/b/id/10106716-L.jpg")
                    .publishedDate(LocalDate.of(2016, 1, 5)).isbn("9781455586691")
                    .publisher("Grand Central").pageCount(296).language("English").build(),

                Book.builder().title("The Alchemist").author("Paulo Coelho")
                    .category("Fiction").price(new BigDecimal("14.99")).stock(110)
                    .rating(4.4).reviewCount(6700)
                    .description("A magical story about following your dreams and listening to your heart.")
                    .imageUrl("https://covers.openlibrary.org/b/id/9256204-L.jpg")
                    .publishedDate(LocalDate.of(1988, 1, 1)).isbn("9780062315007")
                    .publisher("HarperOne").pageCount(208).language("English").build(),

                Book.builder().title("Spring Boot in Action").author("Craig Walls")
                    .category("Programming").price(new BigDecimal("42.99")).stock(30)
                    .rating(4.3).reviewCount(420)
                    .description("Covers Spring Boot development from setup to deployment with real-world examples.")
                    .imageUrl("https://covers.openlibrary.org/b/id/8091962-L.jpg")
                    .publishedDate(LocalDate.of(2016, 1, 1)).isbn("9781617292545")
                    .publisher("Manning").pageCount(264).language("English").build()
            );

            bookRepository.saveAll(books);
            log.info("Sample books seeded: {} books", books.size());
        }
    }
}
