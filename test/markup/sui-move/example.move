/// Short Sui Move sample for markup tests.
module example::short {
    use sui::transfer;

    public struct Counter has key {
        id: sui::object::UID,
        n: u64,
    }

    type Ticks = u32;

    public(package) fun bump(self: &mut Counter) {
        self.n = self.n + 1;
    }

    entry fun main() {
        let mut x = 0u64;
        x = x + 1;
    }
}
