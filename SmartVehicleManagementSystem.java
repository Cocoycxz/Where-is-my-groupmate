interface GPS {
    void navigate();
}

interface Bluetooth {
    void connectBluetooth();
}

class Vehicle {
    private final String brand;
    private final String model;
    private final int year;

    public Vehicle(String brand, String model, int year) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }

    public void displayDetails() {
        System.out.println("Vehicle: " + brand + " " + model);
        System.out.println("Year: " + year);
    }

    public void start() {
        System.out.println("Vehicle is starting.");
    }
}

class Car extends Vehicle {
    private final int numberOfDoors;

    public Car(String brand, String model, int year, int numberOfDoors) {
        super(brand, model, year);
        this.numberOfDoors = numberOfDoors;
    }

    @Override
    public void displayDetails() {
        System.out.println("Car details:");
        super.displayDetails();
        System.out.println("Number of Doors: " + numberOfDoors);
    }

    public void drive() {
        System.out.println("Car is driving.");
    }
}

class SportsCar extends Car implements GPS, Bluetooth {
    private final int topSpeed;

    public SportsCar(
            String brand,
            String model,
            int year,
            int numberOfDoors,
            int topSpeed) {
        super(brand, model, year, numberOfDoors);
        this.topSpeed = topSpeed;
    }

    @Override
    public void displayDetails() {
        System.out.println("Sports Car details:");
        super.displayDetails();
        System.out.println("Top Speed: " + topSpeed + " km/h");
    }

    @Override
    public void start() {
        System.out.println("Sports car engine is starting!");
        super.start();
    }

    public void displaySpeed() {
        System.out.println("Top Speed: " + topSpeed + " km/h");
    }

    @Override
    public void navigate() {
        System.out.println("GPS navigation is active.");
    }

    @Override
    public void connectBluetooth() {
        System.out.println("Bluetooth is connected.");
    }
}

public class SmartVehicleManagementSystem {
    public static void main(String[] args) {
        Vehicle vehicle = new Vehicle("Toyota", "Vios", 2022);
        Car car = new Car("Honda", "Civic", 2023, 4);
        SportsCar sportsCar = new SportsCar("Nissan", "GT-R", 2025, 2, 315);

        System.out.println("=== SMART VEHICLE MANAGEMENT SYSTEM ===");

        vehicle.displayDetails();
        vehicle.start();

        System.out.println();
        car.displayDetails();
        car.start();
        car.drive();

        System.out.println();
        sportsCar.displayDetails();
        sportsCar.start();
        sportsCar.drive();
        sportsCar.displaySpeed();
        sportsCar.navigate();
        sportsCar.connectBluetooth();
    }
}
