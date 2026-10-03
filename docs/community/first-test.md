---
title: Your first model test
description: "Run a standalone FEMU NAND timing test and add boundary assertions using a C compiler and Make, without a guest or KVM."
---

# Your first model test

Add three boundary assertions to FEMU's NAND timing test. This exercise needs
Git, Make, and a C compiler supporting GNU C11. It runs without a guest image,
KVM, or a full QEMU build. Use it to learn the test harness before following
the [developer path](/docs/community/developer-path) into the I/O stack.

The exercise was run on macOS with Apple Clang against the pinned source below.
The same standalone Makefile can be used on Linux. The recorded checks cover
media timing arithmetic; they do not exercise NVMe commands or guest behavior.

## 1. Run the unchanged test

Use a separate checkout so the exercise does not disturb another change:

```bash
git clone https://github.com/MoatLab/FEMU.git FEMU-first-test &&
cd FEMU-first-test &&
git checkout 9d176f89138dfb00dcd2fba2aa61072268d9bf4a &&
cc --version &&
make --version &&
make -C hw/femu/tests check
```

The `&&` chains stop at the first failed command. Resolve that failure before
continuing. All commands below run from this checkout root. At this revision the test
reports **46 passing assertions** and ends with `1..46`. If Make or `cc` is
missing, install your operating system's command-line development tools first.
The standalone target uses a small `qemu/osdep.h` stub bundled with the tests.

## 2. Derive the expected result

Open `hw/femu/tests/unit/test-nand-media.c`. In `test_ecc()`, find the wear
case that sets `cfg.timing.ecc_step_ns = 200000`. Its configuration uses:

<div className="compact-table">

| Quantity | Value |
| --- | --- |
| Base read latency | 10,000 ns |
| Program/erase cycles per wear tier | 750 |
| Added latency per tier | 200,000 ns |
| Maximum combined wear and retention tiers | 4 |

</div>

With retention age zero, the tier count is the integer quotient of wear cycles
divided by 750, capped at four. A read at 749 cycles therefore takes 10,000 ns;
750 and 751 cycles each take 210,000 ns. These adjacent inputs check where the
first tier begins. The existing 1,500-cycle case checks a different point.

`read_lat()` resets the timelines before each call. The cases model independent
reads on an idle array, so their expected times do not include a prior read's
queueing delay. See the [timing model](/docs/timing-model) for scheduling details.

## 3. Add the boundary cases

Immediately before the existing `wear: 1500 P/E = 2 tiers` assertion, add:

```c
    check("wear: 749 P/E stays below one tier", read_lat(&cfg, 749, 0), 10000);
    check("wear: 750 P/E reaches one tier", read_lat(&cfg, 750, 0), 210000);
    check("wear: 751 P/E stays within one tier", read_lat(&cfg, 751, 0), 210000);
```

Alternatively, download [ecc-boundary.patch](/tutorials/ecc-boundary.patch),
save it in the checkout root, and apply it instead of adding the lines manually:

```bash
git apply --check ecc-boundary.patch &&
git apply ecc-boundary.patch
```

The patch targets the pinned revision. If its check fails, inspect your source
revision and local edits before applying it. Do not add the same assertions twice.

## 4. Inspect the result

```bash
make -C hw/femu/tests check &&
git diff --check &&
git diff -- hw/femu/tests/unit/test-nand-media.c
```

The test should now report **49 passing assertions**, including the three new
wear cases, and end with `1..49`. The diff should contain only those assertions.
The model already handles this boundary correctly; this exercise adds coverage.

As a local check that failure is visible, temporarily change the expected
749-cycle result from `10000` to `10001`. Run the test again: that assertion
should print `not ok`, and Make should fail. Restore `10000` and confirm that
all 49 assertions pass. Keep this deliberate wrong expectation out of your patch.

## 5. Bring back a useful contribution

For a real contribution, choose another uncovered boundary or reproduce an
observed defect. Explain the expected result independently of the code under
test. Include the source commit, compiler, command, and test output using the
[contribution guide](/docs/community/contributing). Check existing work before
submitting; the downloadable exercise is a learning example, not an assigned issue.

Continue with [following a black-box write](/docs/community/developer-path#2-follow-one-black-box-write)
when you have a working Linux/KVM guest, or inspect another policy's source and
test coverage without starting a guest.

## Implementation sources

- [Test harness and ECC cases](https://github.com/MoatLab/FEMU/blob/9d176f89138dfb00dcd2fba2aa61072268d9bf4a/hw/femu/tests/unit/test-nand-media.c)
- [Standalone Makefile](https://github.com/MoatLab/FEMU/blob/9d176f89138dfb00dcd2fba2aa61072268d9bf4a/hw/femu/tests/Makefile)
- [NAND timing implementation](https://github.com/MoatLab/FEMU/blob/9d176f89138dfb00dcd2fba2aa61072268d9bf4a/hw/femu/nand/nand-media.c)
