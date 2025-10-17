import pickupService from "../services/pickupService.js";

describe("PickupService", () => {
  beforeEach(() => {
    // Mock the internal DAO functions of the existing instance
    pickupService.pickupDAO = {
      create: jest.fn(),
      findAll: jest.fn(),
    };
  });

  test("should calculate totalQuantity and totalWeight when creating pickup", async () => {
    const mockData = {
      items: [
        { name: "Laptop", quantity: 2, weight: 3 },
        { name: "Phone", quantity: 1, weight: 0.5 },
      ],
      refNumber: "REF001",
      method: "home",
      date: "2025-10-17",
      time: "10:00 AM",
      address: "123 Test St",
    };

    const expectedResult = {
      ...mockData,
      totalQuantity: 3,
      totalWeight: 3.5,
    };

    // Mock DAO create() to return the expected result
    pickupService.pickupDAO.create.mockResolvedValue(expectedResult);

    const result = await pickupService.createPickup(mockData);

    expect(pickupService.pickupDAO.create).toHaveBeenCalledWith(expectedResult);
    expect(result.totalQuantity).toBe(3);
    expect(result.totalWeight).toBe(3.5);
  });

  test("should return all pickups from DAO", async () => {
    const mockPickups = [
      { refNumber: "REF001" },
      { refNumber: "REF002" },
    ];

    // Mock DAO findAll() to return mock pickups
    pickupService.pickupDAO.findAll.mockResolvedValue(mockPickups);

    const result = await pickupService.getAllPickups();

    expect(pickupService.pickupDAO.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockPickups);
  });
});
