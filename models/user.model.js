const mongoose = require("mongoose");

const egyptianCities = [
    "Cairo",
    "Alexandria",
    "Giza",
    "Shubra El-Kheima",
    "Port Said",
    "Suez",
    "Mansoura",
    "Tanta",
    "Asyut",
    "Ismailia",
    "Fayoum",
    "Zagazig",
    "Minya",
    "Damietta",
    "Beni Suef",
    "Luxor",
    "Aswan",
    "6th of October City",
    "Damanhur",
    "Shibin El Kom",
    "Hurghada",
    "Banha",
    "Minya al-Qamh",
    "Kafr El Sheikh",
    "Qena",
    "Sohag",
    "Mahalla",
    "Mersa Matruh",
    "Rashid",
    "Edfu",
    "Kafr El Dawar",
    "El-Mahalla El-Kubra",
    "Beni Suef",
    "Tanta",
    "Gharbia",
    "Qalyubia",
];

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: [1, "First Name must be at least 3 characters long"],
            maxlength: [16, "last Name must be at most 16 characters long"],
        },
        lastName: {
            type: String,
            required: true,
            minlength: [1, "last Name must be at least 3 characters long"],
            maxlength: [16, "last Name must be at most 16 characters long"],
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        phoneNumber: {
            type: String,
            minlength: [11, "Phone number must be 11 characters long"],
            maxlength: [11, "Phone number must be 11 characters long"],
        },
        country: {
            type: String,
            enum: ["Egypt"],
        },
        city: {
            type: String,
            enum: egyptianCities,
        },
        bio: {
            type: String,
            minlength: [3, "bio must be at least 3 characters long"],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        },
        password: {
            type: String,
            // required: true,
            minlength: [8, "Password must be at least 8 characters long"],
            maxlength: [256, "Password must be at most 256 characters long"],
            validate: {
                validator: function (value) {
                    return (
                        /[A-Z]/.test(value) &&
                        /[a-z]/.test(value) &&
                        /[0-9]/.test(value) &&
                        /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
                        !/\s/.test(value)
                    );
                },
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not contain spaces.",
            },
        },
        avatar: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female"],
        },
        role: {
            type: String,
            enum: ["client", "seller", "admin"],
            default: "client",
            required: true,
        },
        wallet: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual("avatarUrl").get(function () {
    if (this.avatar?.split("/")[0] === "users") {
        return process.env.AWS_S3_PUBLIC_BUCKET_URL + this.avatar;
    } else if (this.avatar?.split("/")[0] !== "users") {
        return this.avatar;
    } else {
        return null;
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
