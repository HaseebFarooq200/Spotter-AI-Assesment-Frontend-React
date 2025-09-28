import { useEffect, useRef, useState } from "react"

export default function CountryCitySelect({ 
  label, 
  value = "", 
  onChange, 
  required = false, 
  className = "",
  placeholder = "Enter location"
}) {
  const [inputValue, setInputValue] = useState(value)
  const [isLoaded, setIsLoaded] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Load Google Places API
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
        return
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for the script to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      // Create and load the script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true
      
      // Add callback function to window
      window.initGoogleMaps = () => {
        setIsLoaded(true)
      }
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API')
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  // Initialize autocomplete when API is loaded
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['(cities)'], // Restrict to cities
            fields: ['formatted_address', 'address_components', 'place_id', 'geometry']
          }
        )

        // Add place changed listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace()
          
          if (place && place.formatted_address) {
            const formattedAddress = place.formatted_address
            setInputValue(formattedAddress)
            
            if (onChange) {
              onChange(formattedAddress)
            }
          }
        })
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error)
      }
    }
  }, [isLoaded, onChange])

  // Update local state when value prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Call onChange for manual typing (debounced or on blur might be better for performance)
    if (onChange && newValue !== value) {
      onChange(newValue)
    }
  }

  const handleClear = () => {
    setInputValue("")
    if (onChange) {
      onChange("")
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    // Prevent form submission on Enter key when using autocomplete
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
          disabled={!isLoaded}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            text-sm
            ${inputValue ? 'pr-8' : ''}
          `}
        />
        
        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500">
        {isLoaded ? "Start typing to search locations" : "Loading Google Places..."}
      </div>
    </div>
  )
}