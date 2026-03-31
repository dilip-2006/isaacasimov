import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, User, Phone, Hash, Calendar, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { smsService } from '../../services/smsService';
import { Component } from '../../types';
import { CameraCapture } from '../CameraCapture';

interface RequestManagementProps {
  onUpdate: () => void;
}

const RequestManagement: React.FC<RequestManagementProps> = ({ onUpdate }) => {
  const [components, setComponents] = useState<Component[]>([]);
  
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [year, setYear] = useState('1st Year');
  const [department, setDepartment] = useState('RA');
  const [componentId, setComponentId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [issueImage, setIssueImage] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadComponents();
    // Default due date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const loadComponents = () => {
    setComponents(dataService.getComponents().filter(c => c.availableQuantity > 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!studentName || !rollNo || !mobile || !componentId || !quantity || !dueDate) {
      setError('Please fill all required fields');
      return;
    }

    if (!issueImage) {
      setError('Please capture a photo to issue the component');
      return;
    }

    const component = components.find(c => c.id === componentId);
    if (!component) {
      setError('Selected component not found');
      return;
    }

    if (quantity > component.availableQuantity) {
      setError(`Only ${component.availableQuantity} units available`);
      return;
    }

    // Update component inventory
    component.availableQuantity -= quantity;
    dataService.updateComponent(component);

    // Create a new approved request (issue record)
    dataService.addRequest({
      id: `req-${Date.now()}`,
      studentId: `external-${Date.now()}`, // Dummy ID since there are no user accounts
      studentName,
      rollNo,
      mobile,
      year,
      department,
      componentId,
      componentName: component.name,
      quantity,
      requestDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      status: 'approved', // Pre-approved because the admin is issuing it
      approvedBy: 'Administrator',
      approvedAt: new Date().toISOString(),
      issueImage: issueImage || undefined
    });
    
    // Send simulated SMS
    try {
      const parsedDate = new Date(dueDate).toLocaleDateString();
      const message = `Isaac Asimov Robotics Lab: The component ${component.name} (${quantity} units) has been issued to you. Due date: ${parsedDate}.`;
      await smsService.sendSMS(mobile, message);
      alert(`Simulated: SMS sent to ${mobile}!\n\nMessage: ${message}`);
    } catch (e) {
      console.error("Failed to send SMS", e);
    }

    setSuccess(true);
    onUpdate();
    
    // Reset form partially
    setStudentName('');
    setRollNo('');
    setMobile('');
    setComponentId('');
    setQuantity(1);
    setIssueImage(null);
    
    // Reload components to get updated available quantities
    loadComponents();
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Issue Component</h2>
            <p className="text-yellow-200">Manually issue temporary components to students</p>
          </div>
        </div>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-peacock-500/20 p-6 space-y-6"
      >
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Component issued successfully
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-peacock-300 border-b border-dark-600 pb-2">Student Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-peacock-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500"
                  placeholder="Student Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Roll Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input 
                    type="text" 
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500"
                    placeholder="E.g. 21CS001"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500"
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Year</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500 appearance-none"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500 appearance-none"
                  >
                    <option>RA</option>
                    <option>CSE</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>IT</option>
                    <option>MECH</option>
                    <option>OTHER</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-peacock-300 border-b border-dark-600 pb-2">Component Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-peacock-400 mb-1">Select Component</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <select 
                  value={componentId}
                  onChange={(e) => setComponentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500 appearance-none"
                  required
                >
                  <option value="" disabled>Select a component</option>
                  {components.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.availableQuantity} available)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  max={componentId ? components.find(c => c.id === componentId)?.availableQuantity || 1 : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-peacock-400 mb-1">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-xl text-white focus:border-peacock-500 focus:ring-1 focus:ring-peacock-500 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-600">
              <CameraCapture 
                onCapture={(img) => setIssueImage(img)} 
                label="Student / Component Photo Required"
                previewImage={issueImage}
              />
            </div>
            
            <div className="pt-6">
              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-peacock-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-peacock-500/30 transition-all duration-300"
              >
                Issue Component
              </button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default RequestManagement;