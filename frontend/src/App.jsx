import React, { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsTable from './components/ResultsTable'

export default function App(){
  const [result, setResult] = useState(null)
  return (
    <div className="container">
      <h1>DME & ROD Calculator</h1>
      <InputForm onResult={setResult} />
      {result && <ResultsTable data={result} />}
    </div>
  )
}
