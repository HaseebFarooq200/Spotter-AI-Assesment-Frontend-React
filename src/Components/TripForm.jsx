import { useState } from "react"
import axios from "axios"
import { Input, Form } from "antd"
import CountryCityTreeSelect from "./CountryCitySelect"

export default function TripForm({ onResult }) {
  const [form, setForm] = useState({
    CurrentLocation: "",
    PickupLocation: "",
    DropoffLocation: "",
    CurrentCycleUsed: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // When a location changes, we store "City, Country" as a single string (backend stays the same)
  const handleLocationSelect = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/create_trips/`, form)
      onResult?.(res.data)
    } catch (err) {
      alert("Something Went Wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 max-w-xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <CountryCityTreeSelect
          label="Current Location"
          value={form.CurrentLocation}
          onChange={handleLocationSelect("CurrentLocation")}
          required
        />
        <CountryCityTreeSelect
          label="Pickup Location"
          value={form.PickupLocation}
          onChange={handleLocationSelect("PickupLocation")}
          required
        />
        <CountryCityTreeSelect
          label="Dropoff Location"
          value={form.DropoffLocation}
          onChange={handleLocationSelect("DropoffLocation")}
          required
        />
        <Form.Item
          label="Current Cycle Used"
          required
          className="block text-sm font-medium mb-4"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input
            name="CurrentCycleUsed"
            placeholder="Enter current cycle used"
            value={form.CurrentCycleUsed}
            onChange={handleChange}
            size="large"
            allowClear
          />
        </Form.Item>
        
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Loading..." : "Generate Trip"}
      </button>
    </form>
  )
}

