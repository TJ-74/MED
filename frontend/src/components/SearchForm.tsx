import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchForm.css';

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
    const [selectedService, setSelectedService] = useState<Service | Service[] | null>(null);

    useEffect(() => {
        axios.get<Service[]>('http://localhost:3001/api/services')
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
            const response = await axios.get('http://localhost:3001/api/service', {
                params: { serviceCode: searchTerm, zipCode }
            });
            setSelectedService(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                alert('No matching service found for the provided service code and zip code. Showing nearest match if available.');
            } else {
                console.error('Error fetching service details:', error);
            }
            setSelectedService(null);
        }
    };

    return (
        <div className="search-form">
            <h2>Find a Service</h2>
            <div className="form-group">
                <label htmlFor="service-search">Search by Service Name:</label>
                <input
                    id="service-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type service name"
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
            </div>
            <div className="form-group">
                <label htmlFor="zip-code">Zip Code:</label>
                <input
                    id="zip-code"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter zip code"
                />
            </div>
            <button className="search-button" onClick={handleSearch}>Search</button>

            {selectedService && (
                <div className="results-container">
                    {Array.isArray(selectedService) ? (
                        selectedService.map((service, index) => (
                            <div key={index} className="result-card">
                                <h3>Service Details</h3>
                                <p><strong>Hospital:</strong> {service.serviceHospital}</p>
                                <p><strong>Price:</strong> ${service.servicePrice}</p>
                                <p><strong>Service:</strong> {service.serviceCode}</p>
                                <p><strong>Address:</strong> {service.serviceAddress}</p>
                                <p><strong>Zip Code:</strong> {service.serviceZipcode.slice(0, 5)}</p>
                                {service.serviceZipcode.slice(0, 5) !== zipCode.slice(0, 5) && (
                                    <p className="note"><em>Note: Showing nearest match based on the provided zip code.</em></p>
                                )}
                            </div>
                        ))
                    ) : (
                        selectedService && (
                            <div className="result-card">
                                <h3>Service Details</h3>
                                <p><strong>Hospital:</strong> {selectedService.serviceHospital}</p>
                                <p><strong>Price:</strong> ${selectedService.servicePrice}</p>
                                <p><strong>Service:</strong> {selectedService.serviceCode}</p>
                                <p><strong>Address:</strong> {selectedService.serviceAddress}</p>
                                <p><strong>Zip Code:</strong> {selectedService.serviceZipcode.slice(0, 5)}</p>
                                {selectedService.serviceZipcode.slice(0, 5) !== zipCode.slice(0, 5) && (
                                    <p className="note"><em>Note: Showing nearest match based on the provided zip code.</em></p>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchForm;
