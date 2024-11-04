import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchForm.css';
import Navbar from './Navbar'; 

interface Service {
    serviceCode: string;
    serviceZipcode: string;
    serviceHospital: string;
    servicePrice: string;
    serviceAddress: string;
}

const SearchForm: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [uniqueServiceCodes, setUniqueServiceCodes] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [zipCode, setZipCode] = useState<string>('');
    const [filteredServiceCodes, setFilteredServiceCodes] = useState<string[]>([]);
    const [selectedService, setSelectedService] = useState<Service[]>([]);

    useEffect(() => {
        axios.get<Service[]>('https://med-reveal.vercel.app/api/services')
            .then(response => {
                console.log('Fetched services:', response.data);
                const allServices = response.data;
                setServices(allServices);

                const uniqueCodes = Array.from(new Set(allServices.map((service) => service.serviceCode)));
                setUniqueServiceCodes(uniqueCodes);
            })
            .catch(err => {
                console.error('Error fetching services:', err);
            });
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            const filtered = uniqueServiceCodes.filter(code =>
                code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log('Filtered service codes:', filtered);
            setFilteredServiceCodes(filtered);
        } else {
            setFilteredServiceCodes([]);
        }
    }, [searchTerm, uniqueServiceCodes]);

    const handleSelectService = (serviceCode: string) => {
        setSearchTerm(serviceCode);
        setFilteredServiceCodes([]); // Hide the dropdown after selection
    };

    

    const handleSearch = async () => {
        try {
            const response = await axios.get('https://med-reveal.vercel.app/api/service', {
                params: { serviceCode: searchTerm, zipCode }
            });
            setSelectedService(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                alert('No matching service found for the provided service code and zip code. Showing nearest match if available.');
            } else {
                console.error('Error fetching service details:', error);
            }
            setSelectedService([]);
        }
    };

    return (
        <>
            <Navbar />
        <div className="container">
            <div className="header">
                <h1>Med Reveal Service Finder</h1>
            </div>
            <div className="search-box">
            <div className="form-group" style={{ position: 'relative' }}>
    <input
        id="service-name"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter service name"
        autoComplete="off"
    />
    {filteredServiceCodes.length > 0 && (
        <ul className="dropdown">
            {filteredServiceCodes.map((serviceCode, index) => (
                <li key={index} onClick={() => handleSelectService(serviceCode)}>
                    {serviceCode}
                </li>
            ))}
        </ul>
    )}
   

<input
                    id="zip-code"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter zip code"
                />
             
                <button onClick={handleSearch}>Search</button>

</div>

              
            </div>
            <div className="results" id="results">
                {selectedService.length > 0 ? (
                    selectedService.map((service, index) => (
                        <div key={index} className="result-item">
                            <img
                                src="https://via.placeholder.com/100" // Replace with appropriate image source
                                alt={`Image representing ${service.serviceHospital}`}
                                width="100"
                                height="100"
                            />
                            <div className="details">
                                <h3>{service.serviceHospital}</h3>
                                <p>Location: {service.serviceAddress}</p>
                                <p><strong>Zip Code:</strong> {service.serviceZipcode.slice(0, 5)}</p>
                                <p className="price">${service.servicePrice}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No results found</p>
                )}
            </div>
        </div>
        </>
    );

};

export default SearchForm;
