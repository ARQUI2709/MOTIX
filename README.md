# MOTIX
      {/* Lista de categorías */}
      <div className="space-y-3">
        {Object.entries(metrics.categories).map(([categoryName, categoryMetrics]) => (
          <div 
            key={categoryName}
            onClick={() => onCategoryClick && onCategoryClick(categoryName)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-semibold text-gray-900 mr-3">
                  {categoryName}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(categoryMetrics.status)}`}>
                  {categoryMetrics.status === 'completed' ? 'Completa' :
                   categoryMetrics.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  <CheckCircle2 className="inline mr-1" size={14} />
                  {categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems} ítems
                </span>
                <span>
                  <Target className="inline mr-1" size={14} />
                  {categoryMetrics.completionPercentage}% completo
                </span>
                {categoryMetrics.averageScore > 0 && (
                  <span className={`font-medium ${getScoreColor(categoryMetrics.averageScore)}`}>
                    <TrendingUp className="inline mr-1" size={14} />
                    {categoryMetrics.averageScore}/10 promedio
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {categoryMetrics.completionPercentage}%
              </div>
              {categoryMetrics.totalRepairCost > 0 && (
                <div className="text-sm text-red-600">
                  ${categoryMetrics.totalRepairCost.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>