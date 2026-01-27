import { addMonths, subMonths, addDays } from 'date-fns';

export const currentUser = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    joinedDate: "2023-01-15",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff"
};

export const stats = {
    total: 12,
    active: 8,
    expiringSoon: 2,
    expired: 2
};

export const warranties = [
    {
        id: 1,
        productName: "MacBook Pro M3",
        brand: "Apple",
        category: "Electronics",
        purchaseDate: subMonths(new Date(), 2).toISOString(),
        expiryDate: addMonths(new Date(), 10).toISOString(),
        status: "Active",
        documentUrl: "#",
        icon: "Laptop"
    },
    {
        id: 2,
        productName: "Sony WH-1000XM5",
        brand: "Sony",
        category: "Audio",
        purchaseDate: subMonths(new Date(), 6).toISOString(),
        expiryDate: addMonths(new Date(), 6).toISOString(),
        status: "Active",
        documentUrl: "#",
        icon: "Headphones"
    },
    {
        id: 3,
        productName: "Samsung 4K Monitor",
        brand: "Samsung",
        category: "Electronics",
        purchaseDate: subMonths(new Date(), 11).toISOString(),
        expiryDate: addDays(new Date(), 15).toISOString(),
        status: "Expiring Soon",
        documentUrl: "#",
        icon: "Monitor"
    },
    {
        id: 4,
        productName: "Logitech MX Master 3S",
        brand: "Logitech",
        category: "Accessories",
        purchaseDate: subMonths(new Date(), 13).toISOString(),
        expiryDate: subMonths(new Date(), 1).toISOString(),
        status: "Expired",
        documentUrl: "#",
        icon: "Mouse"
    },
    {
        id: 5,
        productName: "Dyson V15 Detect",
        brand: "Dyson",
        category: "Home",
        purchaseDate: subMonths(new Date(), 1).toISOString(),
        expiryDate: addMonths(new Date(), 23).toISOString(),
        status: "Active",
        documentUrl: "#",
        icon: "Home"
    }
];
