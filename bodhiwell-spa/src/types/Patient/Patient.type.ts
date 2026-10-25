export interface IPatient {
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
    details: {
        date_birth: string;
        gender: string;
        phone: string;
        image: string;
        country: string;
        city: string;
        address: string;
        zipcode: string;
        medical_condition: string;
    };
}


