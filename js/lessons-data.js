/**
 * Central curriculum data. Each lesson has a "basic" (free) and "advanced"
 * (Pro) level; each level has theory sections, a summary, and a quiz. The
 * `simulation` field names which module lesson.js should mount for that
 * level -- see js/simulations/*.js.
 */
const LESSONS = {
  steganography: {
    title: "Steganography",
    icon: "🔒",
    basic: {
      free: true,
      simulation: "bitplane",
      theory: [
        {
          heading: "What is steganography?",
          body: `Steganography hides the <em>existence</em> of a message, not just its
            contents. Where encryption scrambles a message so it can't be read without
            a key, steganography goes a step further: it hides the message inside
            something completely ordinary-looking -- a photo, a song, a video -- so
            that someone intercepting it doesn't even know there's a secret to look
            for.`
        },
        {
          heading: "Hiding vs. encrypting",
          body: `The two are complementary, not competing. StegoTool Pro always
            encrypts a payload <em>before</em> hiding it, so even if someone suspects a
            file and extracts the hidden data, they still need the password to read
            it.`
        },
        {
          heading: "LSB: the fundamental technique",
          body: `LSB (Least Significant Bit) is the simplest, most widely taught
            steganography technique. Every pixel in an image is made of color channel
            values -- for example red, green, and blue, each typically 0-255. Changing
            the very last bit of one of those values shifts the color by at most 1 out
            of 255 -- invisible to the eye, but exactly enough room to hide one bit of
            secret data per channel per pixel.`,
          diagram: "lsb"
        },
        {
          heading: "LSB's capacity and its weakness",
          body: `A 1-megapixel image has roughly 3 million color channel values --
            about 375 KB of hideable capacity using plain LSB. That's the appeal:
            simple, high-capacity, easy to implement. It's also the weakness: flipping
            bits at a fixed, predictable position leaves a detectable statistical
            fingerprint -- the subject of the Advanced level's chi-square attack.`
        }
      ],
      summary: [
        "Steganography hides that a message exists; encryption hides what it says.",
        "StegoTool Pro does both -- encrypt, then hide.",
        "LSB changes only the last bit of a pixel's color value -- invisible to the eye.",
        "LSB's capacity scales directly with pixel count, but its predictable pattern is detectable."
      ],
      quiz: [
        {
          q: "What does steganography hide, that encryption alone doesn't?",
          options: ["The contents of the message", "The existence of the message itself", "The sender's identity", "The file size"],
          correct: 1,
          explain: "Encryption scrambles content so it can't be read; steganography hides the fact that there's a secret message at all."
        },
        {
          q: "Why does StegoTool Pro encrypt a payload before hiding it?",
          options: ["It doesn't -- hiding alone is enough", "Encryption makes the file smaller", "So an extracted payload still needs a password to read", "It's required by the image format"],
          correct: 2,
          explain: "If someone suspects a file and extracts the hidden bytes, encryption is the layer that still protects them."
        },
        {
          q: "In LSB steganography, what part of a pixel actually changes?",
          options: ["The entire pixel is replaced", "Only the least significant bit of a color channel value", "The pixel's position", "The image's file format"],
          correct: 1,
          explain: "Only the last bit of a channel value changes -- at most a 1-in-255 shift, invisible to the eye."
        },
        {
          q: "Roughly how much data can plain LSB hide in a 1-megapixel RGB image?",
          options: ["About 1 KB", "About 375 KB", "About 10 MB", "It depends only on file format, not pixel count"],
          correct: 1,
          explain: "About 3 million channel values means about 3 million bits, roughly 375 KB."
        },
        {
          q: "What's the main weakness of plain LSB steganography?",
          options: ["It can't hide text", "It only works on JPEG files", "Its fixed, predictable bit-flipping pattern is statistically detectable", "It requires a password to encode"],
          correct: 2,
          explain: "Flipping the same bit position across many pixels leaves a detectable statistical fingerprint."
        }
      ]
    },
    advanced: {
      free: false,
      simulation: "ctf",
      theory: [
        {
          heading: "PVD: hiding more, adaptively",
          body: `PVD (Pixel-Value Differencing) looks at the <em>difference</em> between
            neighboring pixels rather than changing each pixel independently. A smooth
            area (sky, a wall) can only absorb a small change before it looks wrong; a
            busy, high-contrast area (foliage, a crowd) can absorb a much bigger one
            without looking different. PVD embeds more bits where the image can hide
            them, and fewer where it can't -- higher capacity than LSB with less visible
            distortion.`,
          diagram: "pvd"
        },
        {
          heading: "DCT: hiding inside JPEG's own math",
          body: `JPEG compression already works by transforming 8x8 blocks of pixels
            into frequency coefficients (the Discrete Cosine Transform) and discarding
            the ones the eye barely notices. DCT-domain steganography hides data by
            adjusting those surviving coefficients directly -- which means the hidden
            data goes through the same compression the rest of the image does, instead
            of being destroyed by it. That's why DCT-domain hiding survives
            re-compression far better than LSB, which a single JPEG re-save can wipe
            out entirely.`,
          diagram: "dct"
        },
        {
          heading: "Spread spectrum: hiding as noise",
          body: `Instead of changing a few pixels a lot, spread spectrum spreads a
            payload very thinly across <em>many</em> samples using a pseudorandom
            sequence derived from the password. Each individual change is tiny --
            smaller than a camera sensor's own natural noise -- so the hidden signal is
            statistically indistinguishable from ordinary sensor noise unless you know
            the exact spreading sequence used to embed it.`,
          diagram: "spread"
        },
        {
          heading: "Why this matters for detection",
          body: `Each technique changes the cover differently, which means each needs
            a different detector. A test built for LSB (like the chi-square attack)
            is blind to PVD and spread spectrum, because neither leaves the same
            fixed-position bit-flip pattern LSB does.`
        }
      ],
      summary: [
        "PVD embeds adaptively: more bits in busy regions, fewer in smooth ones.",
        "DCT-domain hiding survives JPEG re-compression by living inside the compression math itself.",
        "Spread spectrum hides a payload as noise, spread thin across many samples.",
        "No single detector catches all three -- each technique needs its own test."
      ],
      quiz: [
        {
          q: "Why does PVD embed more bits in busy, high-contrast image regions?",
          options: ["Busy regions compress better", "A bigger pixel change is less noticeable there", "PVD only works on colorful images", "It doesn't -- PVD embeds evenly"],
          correct: 1,
          explain: "A smooth area can only absorb a small change before looking wrong; a busy area can absorb more without looking different."
        },
        {
          q: "Why does DCT-domain hiding survive JPEG re-compression better than LSB?",
          options: ["It uses a stronger password", "It hides data in the same frequency coefficients JPEG's own compression preserves", "DCT images can't be re-compressed", "It doesn't -- both survive equally poorly"],
          correct: 1,
          explain: "The hidden data goes through the same compression as the rest of the image, instead of living in pixel bits a re-save destroys."
        },
        {
          q: "What makes spread spectrum hard to detect?",
          options: ["It uses a very strong encryption key", "Each individual change is smaller than typical sensor noise", "It only works on video files", "It doesn't hide any data, just obscures it"],
          correct: 1,
          explain: "Spreading the payload thin across many samples keeps each change below the level of ordinary camera sensor noise."
        },
        {
          q: "Why can't one detector (like the chi-square attack) catch LSB, PVD, and spread spectrum all at once?",
          options: ["It can -- one test catches everything", "Each technique changes the cover in a fundamentally different way, leaving a different fingerprint", "Detectors only work on grayscale images", "PVD and spread spectrum don't actually hide data"],
          correct: 1,
          explain: "A test built around LSB's fixed bit-flip pattern is blind to PVD's difference-based embedding and spread spectrum's noise-like signal."
        }
      ]
    }
  },

  cryptography: {
    title: "Cryptography",
    icon: "🔑",
    basic: {
      free: true,
      simulation: "hash-demo",
      theory: [
        {
          heading: "What is cryptography?",
          body: `Cryptography is the practice of protecting information by transforming
            it so only someone with the right key can read it. It's what makes a
            hidden payload safe even if someone finds and extracts it.`
        },
        {
          heading: "Symmetric encryption",
          body: `In symmetric encryption, the same key locks and unlocks the data
            (e.g. AES). It's fast, and it's what StegoTool Pro uses to encrypt a
            payload before hiding it -- both the person encoding and the person
            decoding need the same password.`
        },
        {
          heading: "Hashing: a one-way fingerprint",
          body: `A hash function turns data into a fixed-size fingerprint. Change even
            one byte of the input and the hash changes completely -- but you can't
            reverse a hash back into the original data. That one-way property is
            exactly why hashing is used to verify a file hasn't changed (StegoTool
            Pro's Hash Calculator), not to hide or protect it.`
        }
      ],
      summary: [
        "Cryptography protects data by transforming it so only a key-holder can read it.",
        "Symmetric encryption uses the same key to lock and unlock -- fast, used to encrypt payloads before hiding.",
        "Hashing is a one-way fingerprint -- used to verify integrity, not to hide data."
      ],
      quiz: [
        {
          q: "What does symmetric encryption mean?",
          options: ["Different keys lock and unlock the data", "The same key locks and unlocks the data", "No key is needed", "The data is hashed instead of encrypted"],
          correct: 1,
          explain: "The same password/key both encrypts and decrypts -- both sides need to know it."
        },
        {
          q: "Why can't you reverse a hash back into its original data?",
          options: ["Hashing is illegal to reverse", "It's a deliberately one-way transformation", "Hashes are always encrypted twice", "You actually can, with the right key"],
          correct: 1,
          explain: "Hash functions are designed to be one-way -- that's what makes them useful for verifying data wasn't tampered with."
        },
        {
          q: "What's hashing actually used for in StegoTool Pro?",
          options: ["Hiding secret data inside files", "Verifying a file's integrity hasn't changed", "Generating passwords", "Encrypting network traffic"],
          correct: 1,
          explain: "The Hash Calculator checks whether a file matches a known-good fingerprint -- not for hiding anything."
        }
      ]
    },
    advanced: {
      free: false,
      simulation: "kdf-visualizer",
      theory: [
        {
          heading: "Why a raw password isn't a good encryption key",
          body: `Passwords are short, guessable, and unevenly distributed -- people
            reuse patterns. Using one directly as an AES key would make brute-forcing
            far easier than the encryption algorithm's own strength suggests it should
            be.`
        },
        {
          heading: "Key derivation functions",
          body: `A key derivation function (KDF) takes a password and a random salt
            and deliberately stretches the work of turning it into a key -- running it
            through many thousands of expensive iterations on purpose. This makes
            checking a single guess slow, which makes brute-forcing millions of
            guesses proportionally slower too.`
        },
        {
          heading: "Salt matters as much as iteration count",
          body: `The salt -- a random value stored alongside the encrypted data, not
            secret -- ensures two people using the exact same password still end up
            with completely different derived keys. Without it, an attacker could
            precompute keys for common passwords once and reuse that table against
            every target (a "rainbow table" attack).`
        }
      ],
      summary: [
        "Raw passwords make weak encryption keys -- short, guessable, reused.",
        "A KDF deliberately stretches password-to-key derivation to slow down brute-forcing.",
        "A random salt stops precomputed-table attacks and makes identical passwords derive different keys."
      ],
      quiz: [
        {
          q: "Why isn't a raw password used directly as an AES encryption key?",
          options: ["AES doesn't accept passwords", "Passwords are short and guessable, making brute-forcing far easier", "It's slower than using a KDF", "Passwords are always too long for AES"],
          correct: 1,
          explain: "A KDF's whole job is to compensate for how weak raw passwords are as key material."
        },
        {
          q: "What does a key derivation function deliberately do?",
          options: ["Makes the password shorter", "Makes deriving a key from a password slow and expensive on purpose", "Encrypts the password twice", "Removes the need for a password entirely"],
          correct: 1,
          explain: "Slowing down a single guess check proportionally slows down brute-forcing many guesses."
        },
        {
          q: "What problem does a random salt solve?",
          options: ["It makes the password stronger by itself", "It stops attackers from reusing a precomputed table of common-password keys", "It compresses the encrypted data", "It's required by law for encryption software"],
          correct: 1,
          explain: "Without a salt, the same password always derives the same key, letting an attacker precompute once and reuse against every target."
        }
      ]
    }
  },

  steganalysis: {
    title: "Steganalysis",
    icon: "🔍",
    basic: {
      free: true,
      simulation: "compare",
      theory: [
        {
          heading: "What is steganalysis?",
          body: `Steganalysis is the flip side of steganography: trying to detect
            whether a file <em>might</em> already contain hidden data, without knowing
            any password. It never proves what's hidden, or even proves something is
            hidden for certain -- it reports a statistical signal, not a verdict.`
        },
        {
          heading: "Why it's genuinely hard",
          body: `A clean, natural photo is already noisy and unpredictable. Good
            steganalysis has to tell the difference between "this looks like ordinary
            sensor noise" and "this looks like ordinary sensor noise that was actually
            manipulated" -- which is exactly why every real detector reports a
            confidence signal, never a guaranteed answer.`
        },
        {
          heading: "A first, visual clue",
          body: `Before any statistics, one simple way to build intuition is to just
            look at what a technique actually changes. The Bit-Plane Inspector from the
            Steganography lesson shows this directly: bit 0 of a natural photo already
            looks like near-random noise, which is exactly why LSB embedding is
            invisible to the eye -- and exactly why a statistical test, not a visual
            one, is what's needed to catch it.`
        }
      ],
      summary: [
        "Steganalysis detects the possibility of hidden data -- a signal, never a proof.",
        "Natural images are already noisy, which is what makes detection genuinely hard.",
        "Visual inspection alone can't catch LSB -- that's why statistical tests exist."
      ],
      quiz: [
        {
          q: "What does a steganalysis result actually tell you?",
          options: ["A definite yes/no on whether data is hidden", "A statistical confidence signal, not a proof", "The exact hidden message", "The password used to hide the data"],
          correct: 1,
          explain: "Every honest steganalysis tool reports a signal or score, never a guaranteed verdict."
        },
        {
          q: "Why is steganalysis genuinely difficult?",
          options: ["Hidden data is always encrypted", "Natural, clean images are already noisy and unpredictable", "Steganography is illegal, so there's no data to study", "Detectors require the original password"],
          correct: 1,
          explain: "A detector has to distinguish ordinary noise from manipulated noise -- both can look similar."
        },
        {
          q: "Why can't you just look at an LSB-encoded image and see the hidden data?",
          options: ["LSB doesn't actually hide anything", "The lowest bit of a natural photo already looks like near-random noise", "LSB only works on black-and-white images", "You need special hardware to see it"],
          correct: 1,
          explain: "That's exactly why LSB embedding is invisible to the eye -- and why statistical, not visual, tests are needed to catch it."
        }
      ]
    },
    advanced: {
      free: false,
      simulation: "detector",
      theory: [
        {
          heading: "The chi-square attack",
          body: `LSB replacement forces the counts of adjacent value pairs (0/1, 2/3,
            4/5, ...) to become nearly equal wherever embedding happened, because
            flipping the last bit shuffles values between each pair. The chi-square
            attack measures exactly how close those pair counts are to equal across
            the whole image, and reports how consistent that is with LSB embedding
            having happened.`,
          diagram: "chisquare"
        },
        {
          heading: "Why it's blind to PVD and spread spectrum",
          body: `Chi-square only looks for LSB's specific fixed-position bit-flip
            pattern. PVD changes pixel-pair differences, not individual bit positions;
            spread spectrum spreads tiny changes across many samples with no
            pair-count signature at all. Neither leaves the fingerprint chi-square is
            built to find.`
        },
        {
          heading: "PVD boundary-artifact detection",
          body: `PVD embedding remaps pixel-pair differences into fixed sub-ranges
            (0-7, 8-15, 16-31, ...). That remapping leaves a visible discontinuity in
            the difference histogram exactly at each range boundary -- a completely
            different fingerprint than chi-square's pair-count symmetry, needing its
            own dedicated test.`,
          diagram: "pvdboundary"
        }
      ],
      summary: [
        "Chi-square tests whether adjacent-value pair counts are unnaturally close to equal -- LSB's signature.",
        "Chi-square is blind to PVD and spread spectrum -- neither shares LSB's fingerprint.",
        "PVD boundary-artifact detection looks for histogram discontinuities at PVD's own range boundaries instead."
      ],
      quiz: [
        {
          q: "What pattern does the chi-square attack actually look for?",
          options: ['Unusually equal counts between adjacent value pairs (0/1, 2/3, etc.)', "A specific color in the image", "The file's compression ratio", "A password embedded in the metadata"],
          correct: 0,
          explain: "LSB replacement shuffles values within each pair, forcing their counts unnaturally close to equal."
        },
        {
          q: "Why is the chi-square attack blind to spread spectrum steganography?",
          options: ["Spread spectrum doesn't hide any real data", "Spread spectrum has no fixed bit-flip position or pair-count signature to detect", "Chi-square only works on audio files", "Spread spectrum images can't be opened"],
          correct: 1,
          explain: "Chi-square is built around LSB's specific pair-count symmetry, which spread spectrum simply doesn't produce."
        },
        {
          q: "What does PVD boundary-artifact detection actually look for?",
          options: ["The same pair-count symmetry as chi-square", "A discontinuity in the pixel-difference histogram at PVD's fixed range boundaries", "A watermark in the image", "Missing EXIF metadata"],
          correct: 1,
          explain: "PVD remaps differences into fixed sub-ranges, leaving a visible jump in the histogram exactly at each boundary."
        }
      ]
    }
  }
};
