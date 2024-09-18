import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [totalPages, setTotalPages] = useState(0);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFileExport = () => {
    console.log('Export file clicked');
  };

  const handleNotificationClick = () => {
    setNotifications(0); // Reset notification count on click
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : 1));
  };

  const handleFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const rendFileUploadRequest = () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append(
      'operations',
      JSON.stringify({
        query: `
          mutation uploadFile($file: Upload!) {
            uploadFile(file: $file)
          }
        `,
        variables: {
          file: null,
        },
      })
    );

    formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
    formData.append('0', selectedFile);

    axios
      .post('http://localhost:3000/graphql', formData, {
        headers: {
          'x-apollo-operation-name': 'uploadFile',
        },
      })
      .then((response) => {
        console.log('File uploaded successfully', response.data);
        fetchVehicles();
      })
      .catch((error) => {
        console.error('Error uploading file', error);
      });
  };

  const fetchVehicles = async () => {
    console.log('hi');
    const query = `
      query ListMembers($page: Int!, $pageSize: Int!, $search: String) {
        listMembers(page: $page, pageSize: $pageSize, search: $search) {
          members {
            id
            first_name
            last_name
            email
            car_make
            car_model
            vin
            manufactured_date
            age_of_vehicle
          }
          totalCount
        }
      }
    `;

    const variables = {
      page: currentPage,
      pageSize: itemsPerPage,
      search: searchQuery || '', // Send searchQuery from your input
    };

    try {
      const response = await axios.post('http://localhost:3003/graphql', {
        query,
        variables,
      });

      const { data } = response.data;

      if (data && data.listMembers) {
        setVehicles(data.listMembers.members);
        const totalRecords = data.listMembers.totalCount;
        setTotalPages(Math.ceil(totalRecords / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };
  // Fetch all vehicles with pagination and search query
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchQuery]);
  

  const handleUpdateClick = (vehicle: any) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  }

  // Handle input changes in modal form
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setVehicleToEdit({ ...vehicleToEdit, [name]: value });
  };

  const handleUpdateSubmit = async () => {
    try {
      const mutation = `
        mutation updateCrudService($updateVehicleInput: UpdateVehicleInput!){
        updateCrudService(updateCrudServiceInput: $updateVehicleInput}){
          id
          first_name
          last_name
          car_model
    }
}
      `;

      const variables = {
        updateCrudServiceInput: vehicleToEdit,
      };

      //updateCrudService($updateVehicleInput: UpdateVehicleInput!)

      await axios.post('http://localhost:3003/graphql', {
        query: mutation,
        variables,
      });

      setIsModalOpen(false);
      // Refresh the list after update
      fetchVehicles(); 
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };
  return (
    <>
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <div className="flex items-center">
          <label className="mr-4">
            <input className="border-2 p-1 rounded" type="file" onChange={handleFileChange} />
            <button onClick={rendFileUploadRequest} className="bg-[#13ce66] w-[100px] ml-1 p-2 rounded justify-center items-center">
              <span>Upload File</span>
            </button>
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="ml-32 p-2 w-[500px] rounded bg-gray-700 text-white"
          />
          <button className="bg-blue-700 p-2 rounded ml-2 w-20">Search</button>
        </div>

        <div className="flex items-center">
          <button onClick={handleFileExport} className="mr-4 bg-blue-500 flex p-2 rounded">
            <img className="w-6 h-6" src="src/assets/icons8-download-96.png" alt="" />
            Export File
          </button>
          <button onClick={handleNotificationClick} className="relative bg-red-500 p-2 rounded">
            <span className="material-icons w-20">
              <img className="w-6 h-6" src="src/assets/icons8-notification-100.png" alt="" />
            </span>
            {notifications > 0 && (
              <span className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full px-2">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </header>
      <div className="container w-full m-14">
        <table className="table-auto w-[93vw] border-collapse border border-gray-300 shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">First Name</th>
              <th className="p-2 border">Last Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Car Make</th>
              <th className="p-2 border">Car Model</th>
              <th className="p-2 border">VIN</th>
              <th className="p-2 border">Manufacture Date</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Update</th>
              <th className="p-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle: any) => (
                <tr key={vehicle.id}>
                  <td className="p-2 border">{vehicle.id}</td>
                  <td className="p-2 border">{vehicle.first_name}</td>
                  <td className="p-2 border">{vehicle.last_name}</td>
                  <td className="p-2 border">{vehicle.email}</td>
                  <td className="p-2 border">{vehicle.car_make}</td>
                  <td className="p-2 border">{vehicle.car_model}</td>
                  <td className="p-2 border">{vehicle.vin}</td>
                  <td className="p-2 border">{new Date(vehicle.manufactured_date).toLocaleDateString('en-CA')}</td>
                  <td className="p-2 border">{vehicle.age_of_vehicle}</td>
                  <td className="p-2 border">
                    <button onClick={() => handleUpdateClick(vehicle)} className="bg-blue-500 text-white p-1 rounded">
                      Update
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button className="bg-red-500 text-white p-1 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border text-center" colSpan={11}>
                  No vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for updating the vehicle */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Update Vehicle</h2>
            {vehicleToEdit && (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateSubmit(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700">id</label>
                  <input
                    type="text"
                    name="id"
                    value={vehicleToEdit.id}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={vehicleToEdit.first_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={vehicleToEdit.last_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Car Model</label>
                  <input
                    type="text"
                    name="car_model"
                    value={vehicleToEdit.car_model}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded mr-2">
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;

