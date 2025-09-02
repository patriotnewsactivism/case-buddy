import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { LegalAnalyticsService } from "./legal-analytics";
import authRoutes from "./auth-routes";
import subscriptionRoutes from "./subscription-routes";
import { optionalAuth, authenticateUser } from "./auth";
import { checkSubscription, requireActiveSubscription } from "./subscription-middleware";
import { briefGenerationService } from "./services/briefGeneration";
import { ocrService } from "./services/ocrService";
import { precedentResearchService } from "./services/precedentResearch";
import { semanticSearchService } from "./services/semanticSearch";
import { couponService } from "./services/couponService";
import { transcriptionService } from "./services/transcriptionService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(optionalAuth);

  // Authentication routes
  app.use("/api/auth", authRoutes);
  
  // Subscription routes
  app.use("/api/subscription", subscriptionRoutes);
  
  // Add subscription check for protected routes
  app.use(checkSubscription);

  // This endpoint is used to serve public assets.
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // This endpoint is used to serve private objects that can be accessed publicly
  // (i.e.: without authentication and ACL check).
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // This endpoint is used to get the upload URL for an object entity.
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // An example endpoint for updating the model state after an object entity is uploaded (document in this case).
  app.put("/api/documents", async (req, res) => {
    if (!req.body.documentURL) {
      return res.status(400).json({ error: "documentURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.documentURL,
      );

      // In a real implementation, you would save this to the database
      // For now, we'll just return the normalized path
      res.status(200).json({
        objectPath: objectPath,
        success: true,
      });
    } catch (error) {
      console.error("Error processing document upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transcription endpoints (Premium feature - require active subscription for full features)
  app.post("/api/transcription/audio", async (req, res) => {
    try {
      const { audioUrl, filePath, languageTag, includeAISummary } = req.body;

      if (!audioUrl && !filePath) {
        return res.status(400).json({ 
          success: false, 
          error: "Either audioUrl or filePath is required" 
        });
      }

      let result;
      if (audioUrl) {
        result = await transcriptionService.transcribeAudioFromUrl(audioUrl, {
          languageTag: languageTag || 'en-us',
          transcriptionMode: 'highAccuracy',
          includeAISummary: includeAISummary !== false,
        });
      } else {
        result = await transcriptionService.transcribeAudioFile(filePath, {
          languageTag: languageTag || 'en-us',
          transcriptionMode: 'highAccuracy',
          includeAISummary: includeAISummary !== false,
          includeAIAnalysis: true,
        });
      }

      res.json(result);
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Transcription failed' 
      });
    }
  });

  app.get("/api/transcription/status/:interactionId", async (req, res) => {
    try {
      const { interactionId } = req.params;
      const status = await transcriptionService.getInteractionStatus(interactionId);
      res.json({ success: true, ...status });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Status check failed' 
      });
    }
  });

  app.get("/api/transcription/transcript/:interactionId", async (req, res) => {
    try {
      const { interactionId } = req.params;
      const transcript = await transcriptionService.getTranscript(interactionId);
      res.json({ success: true, transcript });
    } catch (error) {
      console.error('Get transcript error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get transcript' 
      });
    }
  });

  // Legal Analytics API Routes (Premium features - require active subscription)
  app.post("/api/legal-analytics/predict-outcome", requireActiveSubscription, LegalAnalyticsService.predictCaseOutcome);
  app.post("/api/legal-analytics/judge-analytics", requireActiveSubscription, LegalAnalyticsService.analyzeJudge);
  app.post("/api/legal-analytics/find-precedents", requireActiveSubscription, LegalAnalyticsService.findRelevantPrecedents);
  app.post("/api/legal-analytics/strategy-recommendations", requireActiveSubscription, LegalAnalyticsService.generateStrategyRecommendations);
  app.post("/api/legal-analytics/analyze-evidence", requireActiveSubscription, LegalAnalyticsService.analyzeEvidence);
  app.post("/api/legal-analytics/similar-cases", requireActiveSubscription, LegalAnalyticsService.findSimilarCases);

  // Legal Brief Generation API Routes (Premium features - require active subscription)
  app.post("/api/brief-generation/generate", requireActiveSubscription, async (req, res) => {
    try {
      const { briefGenerationService } = await import('./services/briefGeneration');
      const brief = await briefGenerationService.generateLegalBrief(req.body);
      res.json({ success: true, brief });
    } catch (error: any) {
      console.error('Brief generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to generate legal brief' 
      });
    }
  });

  app.get("/api/brief-generation/templates", async (req, res) => {
    try {
      const { briefGenerationService } = await import('./services/briefGeneration');
      const templates = briefGenerationService.getBriefTemplates();
      res.json({ success: true, templates });
    } catch (error: any) {
      console.error('Error fetching brief templates:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch brief templates' 
      });
    }
  });

  app.post("/api/brief-generation/summary", requireActiveSubscription, async (req, res) => {
    try {
      const { briefGenerationService } = await import('./services/briefGeneration');
      const summary = await briefGenerationService.generateBriefSummary(req.body.brief);
      res.json({ success: true, summary });
    } catch (error: any) {
      console.error('Brief summary generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to generate brief summary' 
      });
    }
  });

  // Document OCR and Analysis Routes
  app.post("/api/documents/ocr", requireActiveSubscription, async (req, res) => {
    try {
      const { filePath, fileName } = req.body;
      
      if (!filePath || !fileName) {
        return res.status(400).json({ error: "File path and name are required" });
      }
      
      const ocrResult = await ocrService.extractTextFromDocument(filePath, fileName);
      
      // Perform detailed analysis
      const detailedAnalysis = await ocrService.performDetailedDocumentAnalysis(ocrResult);
      
      res.json({ 
        success: true, 
        ocr: ocrResult,
        analysis: detailedAnalysis
      });
    } catch (error: any) {
      console.error('OCR processing error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to process document' 
      });
    }
  });

  // Legal Precedent Research Routes
  app.post("/api/legal-research/precedents", requireActiveSubscription, async (req, res) => {
    try {
      const researchQuery = req.body;
      
      if (!researchQuery.legalIssue) {
        return res.status(400).json({ error: "Legal issue is required" });
      }
      
      const results = await precedentResearchService.conductResearch(researchQuery);
      
      res.json({ 
        success: true, 
        research: results
      });
    } catch (error: any) {
      console.error('Legal research error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to conduct legal research' 
      });
    }
  });

  // Semantic Document Search Routes
  app.post("/api/documents/semantic-search", requireActiveSubscription, async (req, res) => {
    try {
      const searchQuery = req.body;
      
      if (!searchQuery.query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await semanticSearchService.performSemanticSearch(searchQuery);
      
      res.json({ 
        success: true, 
        results: results
      });
    } catch (error: any) {
      console.error('Semantic search error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to perform semantic search' 
      });
    }
  });

  // Find Similar Documents
  app.get("/api/documents/:id/similar", requireActiveSubscription, async (req, res) => {
    try {
      const { id } = req.params;
      const maxResults = parseInt(req.query.maxResults as string) || 10;
      
      const similarDocs = await semanticSearchService.findSimilarDocuments(id, maxResults);
      
      res.json({ 
        success: true, 
        similarDocuments: similarDocs
      });
    } catch (error: any) {
      console.error('Similar documents search error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to find similar documents' 
      });
    }
  });

  // Advanced Search by Legal Concept
  app.post("/api/legal-research/concept-search", requireActiveSubscription, async (req, res) => {
    try {
      const { concept, caseId } = req.body;
      
      if (!concept) {
        return res.status(400).json({ error: "Legal concept is required" });
      }
      
      const results = await semanticSearchService.searchByLegalConcept(concept, caseId);
      
      res.json({ 
        success: true, 
        results: results
      });
    } catch (error: any) {
      console.error('Legal concept search error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to search by legal concept' 
      });
    }
  });

  // Evidence Search
  app.post("/api/legal-research/evidence-search", requireActiveSubscription, async (req, res) => {
    try {
      const { factPattern, caseId } = req.body;
      
      if (!factPattern) {
        return res.status(400).json({ error: "Fact pattern is required" });
      }
      
      const results = await semanticSearchService.findEvidence(factPattern, caseId);
      
      res.json({ 
        success: true, 
        results: results
      });
    } catch (error: any) {
      console.error('Evidence search error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to search for evidence' 
      });
    }
  });

  // Precedent Search
  app.post("/api/legal-research/precedent-search", requireActiveSubscription, async (req, res) => {
    try {
      const { legalIssue } = req.body;
      
      if (!legalIssue) {
        return res.status(400).json({ error: "Legal issue is required" });
      }
      
      const results = await semanticSearchService.researchPrecedents(legalIssue);
      
      res.json({ 
        success: true, 
        results: results
      });
    } catch (error: any) {
      console.error('Precedent search error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to search precedents' 
      });
    }
  });

  // Add document to search index
  app.post("/api/documents/index", requireActiveSubscription, async (req, res) => {
    try {
      const document = req.body;
      
      if (!document.id || !document.title) {
        return res.status(400).json({ error: "Document ID and title are required" });
      }
      
      await semanticSearchService.addDocumentToIndex(document);
      
      res.json({ 
        success: true, 
        message: "Document added to search index"
      });
    } catch (error: any) {
      console.error('Document indexing error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to index document' 
      });
    }
  });

  // Coupon Management Routes
  
  // Validate coupon code
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, orderAmount, planType } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }
      
      const userId = (req as any).user?.id;
      const result = await couponService.validateCoupon(code, userId, orderAmount, planType);
      
      res.json(result);
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      res.status(500).json({ 
        valid: false, 
        error: error.message || 'Failed to validate coupon' 
      });
    }
  });

  // Apply coupon during registration/subscription
  app.post("/api/coupons/apply", authenticateUser, async (req, res) => {
    try {
      const { couponId, originalAmount, discountApplied, subscriptionId, metadata } = req.body;
      const userId = (req as any).user.id;
      
      if (!couponId || originalAmount === undefined || discountApplied === undefined) {
        return res.status(400).json({ 
          error: "Coupon ID, original amount, and discount amount are required" 
        });
      }
      
      await couponService.applyCoupon(
        couponId, 
        userId, 
        originalAmount, 
        discountApplied, 
        subscriptionId, 
        metadata
      );
      
      res.json({ 
        success: true, 
        message: "Coupon applied successfully" 
      });
    } catch (error: any) {
      console.error('Coupon application error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to apply coupon' 
      });
    }
  });

  // Admin Routes (require admin role)
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Create coupon (admin only)
  app.post("/api/admin/coupons", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const couponData = req.body;
      couponData.createdBy = (req as any).user.id;
      
      const coupon = await couponService.createCoupon(couponData);
      
      res.json({ 
        success: true, 
        coupon 
      });
    } catch (error: any) {
      console.error('Coupon creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create coupon' 
      });
    }
  });

  // Get all coupons (admin only)
  app.get("/api/admin/coupons", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const coupons = await couponService.getAllCoupons();
      
      res.json({ 
        success: true, 
        coupons 
      });
    } catch (error: any) {
      console.error('Fetch coupons error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch coupons' 
      });
    }
  });

  // Update coupon (admin only)
  app.put("/api/admin/coupons/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const coupon = await couponService.updateCoupon(id, updateData);
      
      res.json({ 
        success: true, 
        coupon 
      });
    } catch (error: any) {
      console.error('Coupon update error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to update coupon' 
      });
    }
  });

  // Deactivate coupon (admin only)
  app.delete("/api/admin/coupons/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const coupon = await couponService.deactivateCoupon(id);
      
      res.json({ 
        success: true, 
        message: "Coupon deactivated successfully",
        coupon 
      });
    } catch (error: any) {
      console.error('Coupon deactivation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to deactivate coupon' 
      });
    }
  });

  // Get coupon analytics (admin only)
  app.get("/api/admin/coupons/analytics/:id?", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const couponId = req.params.id ? parseInt(req.params.id) : undefined;
      
      const analytics = await couponService.getCouponAnalytics(couponId);
      
      res.json({ 
        success: true, 
        analytics 
      });
    } catch (error: any) {
      console.error('Coupon analytics error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch analytics' 
      });
    }
  });

  // Bulk create coupons (admin only)
  app.post("/api/admin/coupons/bulk", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { template, count, prefix } = req.body;
      
      if (!template || !count || count <= 0 || count > 100) {
        return res.status(400).json({ 
          error: "Valid template and count (1-100) are required" 
        });
      }
      
      template.createdBy = (req as any).user.id;
      const coupons = await couponService.bulkCreateCoupons(template, count, prefix);
      
      res.json({ 
        success: true, 
        message: `${coupons.length} coupons created successfully`,
        coupons 
      });
    } catch (error: any) {
      console.error('Bulk coupon creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create coupons' 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "Case Intelligence Portal API"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
