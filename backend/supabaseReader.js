const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();




// Initialize Supabase client
const supabase = createClient('https://kcklbzeaocexdwhcsiat.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja2xiemVhb2NleGR3aGNzaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk3NzI3MTksImV4cCI6MjAzNTM0ODcxOX0.T7ooLFl6wuHF9FYlaVInWk4_ctvgpjjy7Q2trqiSkOM');

const readFromSupabase = async () => {
    try {
        // Replace 'your_table_name' with the actual name of your table
        const { data, error } = await supabase
            .from('Cigna_LocalPlus')
            .select('billing_code_description, zip_code, organization_name, negotiated_rate, city, address_line_1');

        if (error) {
            throw error;
        }

        // Transform the data into the desired format
        const results = data.map(row => ({
            serviceCode: row.billing_code_description,
            serviceZipcode: row.zip_code,
            serviceHospital: row.organization_name,
            servicePrice: row.negotiated_rate,
            serviceCity: row.city,
            serviceAddress: row.address_line_1
        }));

        return results;
    } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        throw error;
    }
};

module.exports = { readFromSupabase };
